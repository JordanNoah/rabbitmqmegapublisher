import {Connection,Channel, connect, ConsumeMessage, Options} from "amqplib"
import SocketIo from 'socket.io'
import { socketManager } from "../presentation/server"
import Semaphore from "semaphore-async-await"

interface rabbitConfig {
    username: string,
    password: string,
    protocol: string,
    hostname: string
    port: number,
    vhost: string,
    queue: string,
    exchange: string,
    routingKey: string,
    typeExchange: string
}

export class Rabbitmq {
    public static start(rabbit: rabbitConfig, values:any){

        var config: Options.Connect = {
            username: rabbit.username,
            password: rabbit.password,
            protocol: rabbit.protocol,
            hostname: rabbit.hostname,
            port: rabbit.port,
            vhost: rabbit.vhost
        }

        connect(config).then((connection) => {
            connection.createConfirmChannel().then((channel) => {
                channel.assertQueue(
                    rabbit.queue,
                    {
                        exclusive:false,
                        durable:true
                    }
                ).then( async (queue) => {
                    const concurrencySemaphore = new Semaphore(1);
                    for (let index = 0; index < values.length; index++) {
                        await concurrencySemaphore.acquire();
                        const element = values[index];
                        channel.sendToQueue(
                            rabbit.queue,
                            Buffer.from('prueba')
                        )

                        var objectSocket = {
                            processed:index,
                            notProcessed:values.length - (index+1),
                            percent: ((index+1)/values.length) * 100
                        }

                        console.log(objectSocket);
                        

                        socketManager.emit('processedEventRabbit',objectSocket)
                        concurrencySemaphore.release();
                    }
                })
            })
            
        }).catch((err) => {
            console.log(err);
        })
    }
}