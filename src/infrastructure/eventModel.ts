import { DataTypes, Model, Sequelize } from "sequelize"

interface Event extends Model {
    id: number;
    uuid: string;
    queue: string;
    event: string;
    payload: any; // ajusta el tipo según tu estructura real
  }

export const eventModel = (sequelize:Sequelize) => {
    return sequelize.define<Event>('domain_event_listen_queue',{
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
        },
        created_at:{
            type:DataTypes.DATE
        }
    },{
        tableName:'domain_event_listen_queue',
        timestamps:false
    })
}