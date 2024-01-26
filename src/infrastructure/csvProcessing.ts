import axios from 'axios'
import { socketManager } from "../presentation/server";

const cvsProcessing = async function (csvData: any){
    for (let index = 0; index < csvData.length; index++) {
        const element = csvData[index];
        try {
            var response = await axios.get(`http://test-academic-administration.fbr.group/v2/sign-ups/students-with-inscriptions/${element.uuidStudent}`)
            socketManager.emit('processedElement',element)
        } catch (error) {
            console.log(`Error procesando la inscripcion con uuid: ${element.uuidStudent}`);
        }
    }
    socketManager.emit('finishedProcess',true)
}

export default cvsProcessing;