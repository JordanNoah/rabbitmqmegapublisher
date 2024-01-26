import { Router } from "express"
import path, { parse } from "path"
import upload from "../infrastructure/multer/multer"
import fs from 'fs/promises';
import fsreader from 'fs'
import csv from 'csv-parser'
import { StudentDto } from "../domain/dtos/students.dto";
import csvProcessing from "../infrastructure/csvProcessing"
import { Options, Sequelize, DataTypes, Model, Op } from "sequelize";
import { log } from "console";
import { Rabbitmq } from "../infrastructure/rabbitMq";
import { eventModel } from "../infrastructure/eventModel";



  
  interface CleanedEvent {
    id: number;
    uuid: string;
    queue: string;
    event: string;
    payload: any; // ajusta el tipo según tu estructura real
    status: string;
  }

export class AppRoutes {
    static get routes(): Router {
        const router = Router()
        
        router.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, './public/index.html'))
        })

        router.post('/csv/upload', upload.single('file'), async (req, res) => {
            var files = await fs.readdir('src/presentation/public/docs')
            var filesfilter = files.filter(file => {
                return file !== req.file?.filename
            })

            var deleteFilePromises = filesfilter.map(file =>
                fs.unlink(path.join('src/presentation/public/docs', file))
            );

            await Promise.all(deleteFilePromises)

            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            res.json({ message: 'File uploaded successfully', file: req.file });
        })

        router.get('/csv/get', async (req, res) => {
            var csvData: any[] = [];
            var files = await fs.readdir('src/presentation/public/docs')

            var file = files[0]

            const fileStream = fsreader.createReadStream(`src/presentation/public/docs/${file}`)
                .pipe(csv())
                .on('data', (row) => {
                    const [error, student] = StudentDto.create(row);

                    if (error) {
                        console.error('Error al procesar fila del CSV:', error);
                    } else {
                        csvData.push(student);
                    }
                });

            fileStream.on('end', () => {
                res.json({ students: csvData });
            });

            fileStream.on('error', (error) => {
                console.error('Error al leer el archivo CSV:', error.message);
                res.status(500).json({ error: 'Error al leer el archivo CSV.' });
            });
        })

        router.post('/csv/processing', async (req,res) => {
            var csvData: any[] = [];
            var files = await fs.readdir('src/presentation/public/docs')

            var file = files[0]

            const fileStream = fsreader.createReadStream(`src/presentation/public/docs/${file}`)
                .pipe(csv())
                .on('data', (row) => {
                    const [error, student] = StudentDto.create(row);

                    if (error) {
                        console.error('Error al procesar fila del CSV:', error);
                    } else {
                        csvData.push(student);
                    }
                });

            fileStream.on('end', () => {
                csvProcessing(csvData)
            });

            fileStream.on('error', (error) => {
                console.error('Error al leer el archivo CSV:', error.message);
                res.status(500).json({ error: 'Error al leer el archivo CSV.' });
            });

            res.json({processing:true})
        })

        router.post('/database/connect', async (req, res) => {
            try{
                const { host, username, password} = req.body

                var config: Options = {
                    host,
                    username,
                    password,
                    logging:false,
                    port:3306,
                    dialect:'mysql'
                }
    
                const sequelize = new Sequelize(config)
                
                var [databases] = await sequelize.query('SHOW DATABASES')
            
                res.send({error:false, message: databases})
            }catch(error){
                res.send({error:true, message:'Error connected'})
            }
        })

        router.post('/database/data', async (req,res) => {
            const { host, username, password, dbname, page, itemsPage} = req.body

            var config: Options = {
                host,
                username,
                password,
                database:dbname,
                logging:(msg) => {console.log(msg);},
                port:3306,
                dialect:'mysql'
            }

            const sequelize = new Sequelize(config)

            var sequelizeEvent = eventModel(sequelize)

            sequelize.sync().then(async () => {
                var events = await sequelizeEvent.findAll({
                    where:{
                        event:'academic-administration.sign-ups.student_signedup',
                        created_at:{
                            [Op.gte]:new Date('2024-01-17 00:00:00')
                        }
                    },
                    limit:itemsPage,
                    offset:(page - 1) * itemsPage
                })

                console.log(events[0]);
                

                const eventClean = events.map(function (element) {
                    return {
                        id: element.id,
                        uuid: element.uuid,
                        queue: element.queue,
                        event: element.event,
                        payload: element.payload,
                        status: 'not sended'
                    };
                  });
                
                var totalEvents = await sequelizeEvent.count({
                    where:{
                        event:'academic-administration.sign-ups.student_signedup',
                        created_at:{
                            [Op.gte]:new Date('2024-01-17 00:00:00')
                        }
                    },
                })
                res.json({
                    total:totalEvents,
                    events:eventClean
                })
            }).catch((error)=>{
                console.log("error: ",error);
            })
        })

        router.post("/rabbit/sync", async(req,res) => {            
            const { rabbit, database } = req.body

            console.log(rabbit);
            

            var config: Options = {
                host: database.host,
                username: database.username,
                password: database.password,
                database: database.dbname,
                logging:false,
                port:3306,
                dialect:'mysql'
            }

            const sequelize = new Sequelize(config)

            var sequelizeEvent = eventModel(sequelize)

            sequelize.sync().then(async () => {
                sequelizeEvent.findAll({
                    where:{
                        event:'academic-administration.sign-ups.student_signedup'
                    },
                    raw:true
                }).then((values) => {
                    console.log(values[0]);
                    
                    Rabbitmq.start(rabbit,values)
                })
            })

            res.json({processing:true,totalRows: await sequelizeEvent.count()})
        })

        return router
    }
}