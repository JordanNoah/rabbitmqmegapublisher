import { Router } from "express"
import path, { parse } from "path"
import upload from "../infrastructure/multer/multer"
import fs from 'fs/promises';
import fsreader from 'fs'
import csv from 'csv-parser'
import { StudentDto } from "../domain/dtos/students.dto";
import csvProcessing from "../infrastructure/csvProcessing"
import { Options, Sequelize, DataTypes, Model } from "sequelize";
import { log } from "console";


interface Event extends Model {
    id: number;
    uuid: string;
    queue: string;
    event: string;
    payload: any; // ajusta el tipo según tu estructura real
  }
  
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
            
            res.send(databases)
        })

        router.post('/database/data', async (req,res) => {
            const { host, username, password, dbname, page, itemsPage} = req.body

            console.log(req.body);
            

            var config: Options = {
                host,
                username,
                password,
                database:dbname,
                logging:false,
                port:3306,
                dialect:'mysql'
            }

            console.log(config);
            

            const sequelize = new Sequelize(config)

            var sequelizeEvent = sequelize.define<Event>('domain_event_listen_queue',{
                id:{
                    type:DataTypes.INTEGER,
                    primaryKey: true
                },
                uuid:{
                    type:DataTypes.TEXT,
                },
                connection:{
                    type:DataTypes.TEXT,
                },
                queue:{
                    type:DataTypes.TEXT,
                },
                event:{
                    type:DataTypes.TEXT,
                },
                payload:{
                    type:DataTypes.TEXT,
                },
                exception:{
                    type:DataTypes.TEXT,
                }
            },{
                tableName:'domain_event_listen_queue',
                timestamps:false
            })

            sequelize.sync().then(async () => {
                var events = await sequelizeEvent.findAll({
                    limit:itemsPage,
                    offset:(page - 1) * itemsPage
                })

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
                
                var totalEvents = await sequelizeEvent.count()
                res.json({
                    total:totalEvents,
                    events:eventClean
                })
            }).catch((error)=>{
                console.log("error: ",error);
            })
        })

        return router
    }
}