new Vue({
    el:"#app",
    vuetify: new Vuetify(),
    data:{
        mainView: false,
        csvView: true,
        dbView: false,
        file: null,
        uploated_file: null,
        errorSnackBar:{
            status: false,
            message: ''
        },
        listStudent:[],
        listStudentHeader:[
            {
                text:'Nombre',
                value:'name'
            },
            {
                text:'Apellido',
                value:'lastname'
            },
            {
                text:'UUID Alumno',
                value:'uuidStudent'
            },
            {
                text:'Estado',
                value:'state'
            }
        ],
        processingCvs: false,
        io: io("")
    },
    mounted: function(){
        console.log(this.io);
    },
    methods:{
        mainViewChange(){
            this.mainView = true
            this.cssView = false
            this.dbView = false
        },
        cssViewChange(){
            this.mainView = false
            this.csvView = true
            this.dbView = false
        },
        dbViewChange(){
            this.mainView = false
            this.csvView = false
            this.dbView = true
        },
        opencsvuploaddialog(){
            this.$refs.file.click()
        },
        uploadFile() {
            this.file = this.$refs.file.files[0];
            console.log(this.file);
        },
        cleanCsv(){
            this.file = null
            this.$refs.file.value = ""
        },
        startProcess(){
            const formData = new FormData()
            formData.append('file',this.file)
            const headers = { 'Content-Type':'multipart/form-data' }
            axios.post('./csv/upload',formData,{headers}).then((res)=>{
                if(res.status == 400){
                    this.errorSnackBar.status = true
                    this.errorSnackBar.message = res.data.error
                }else{
                    this.uploated_file = res.data.file
                    this.getDataFile()
                }
            })
        },
        getDataFile(){
            axios.get('./csv/get').then((res) => {
                this.listStudent = res.data.students
            })
        },
        startProcessingCvs(){
            this.processingCvs = true
            axios.post("./csv/processing").then((res) => {
                console.log(res.data);
            })
        }
    }
})