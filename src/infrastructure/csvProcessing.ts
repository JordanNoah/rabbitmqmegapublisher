import axios from 'axios'

const cvsProcessing = async function (csvData: any){
    for (let index = 0; index < csvData.length; index++) {
        const element = csvData[index];
        var response = await axios.get('https://pokeapi.co/api/v2/pokemon/ditto')
        console.log(response.data);
    }
}

export default cvsProcessing;