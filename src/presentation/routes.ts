import { Router } from "express"
import path, { parse } from "path"
import upload from "../infrastructure/multer/multer"
import fs from 'fs/promises';
import fsreader from 'fs'
import csv from 'csv-parser'
import { StudentDto } from "../domain/dtos/students.dto";
import csvProcessing from "../infrastructure/csvProcessing"
import SocketIo from 'socket.io';

export class AppRoutes {
    public static io: SocketIo.Server;

    constructor(io: SocketIo.Server){
        AppRoutes.io = io
    }

    static get routes(): Router {
        const router = Router()

        router.get('/', (req, res) => {
            console.log(AppRoutes.io);
            
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

        return router
    }
}