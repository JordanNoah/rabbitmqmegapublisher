new Vue({
    el:"#app",
    vuetify: new Vuetify(),
    data:{
        mainView: true,
        csvView: false,
        dbView: false,
        file: null,
        uploated_file: null,
        errorSnackBar:false,
        errorSnackBarMessage:'',
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
        io: io(""),
        validDb:true,
        rulesDb:{
            hostDb:[
                v => !!v || 'Host es requerido'
            ],
            usernameDb:[
                v => !!v || 'Usuario es requerido'
            ],
            passwordDb:[
                v => !!v || 'Password es requerida'
            ]
        },
        database:{
            host:null,
            username:null,
            password:null
        },
        availableDatabases:null,
        selectedDb:null,
        options:{},
        itemsEvents:[],
        headersEvents:[
            {
                text:'Id',
                value:'id'
            },
            {
                text:'uuid',
                value:'uuid'
            },
            {
                text:'event',
                value:'event'
            },
            {
                text:'payload',
                value:'payload'
            }
        ],
        totalEventsItems:0,
        rabbitMqConfig:{
            username:'team-accion-docente',
            password:'sF&34#hjghGH@',
            protocol:'amqp',
            hostname:'35.222.192.45',
            port:5672,
            vhost:'/',
            queue:'teaching-action.students-academic-synchronization',
            exchange:'sagittarius-a',
            routingKey:'sagittarius-a',
            typeExchange:'fanout'
        },
        rabbitMqConfigRules:{
            username:[v => !!v || 'El usuario es necesario'],
            password:[v => !!v || 'La contraseña es necesario'],
            protocol:[v => !!v || 'El protocolo es necesaria'],
            hostname:[v => !!v || 'El hostname es necesario'],
            port:[v => !!v || 'El puerto es necesario'],
            vhost:[v => !!v || 'El vhost es necesario'],
            queue:[v => !!v || 'El queue es necesario'],
            typeExchange:[v => !!v || 'El type exchange es necesaria'],
        },
        validRabbitmq: false,
        processedEvents:0,
        percentProcess:0
    },
    mounted: function(){
        this.io.on("processedElement", (msg) => {
            var index = this.listStudent.findIndex(item => item.uuidStudent === msg.uuidStudent)
            this.listStudent[index].state = 'Processed'
        })
        this.io.on("finishedProcess",(msg)=>{
            this.processingCvs = false
        })
        this.io.on("processedEventRabbit", (msg) => {
            this.totalEventsItems = msg.notProcessed
            this.processedEvents = msg.processed

            this.percentProcess = msg.percent
        })
    },
    watch:{
        'options.itemsPerPage':{
            handler(){
                if(this.selectedDb){
                    this.getDataFromDb()
                }
            },
            deep: true
        },
        'options.page':{
            handler(){
                if(this.selectedDb){
                    this.getDataFromDb()
                }
            },
            deep: true
        }
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
                    this.errorSnackBar = true
                    this.errorSnackBarMessage = res.data.error
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
        },
        connectDb(){
            if (this.$refs.form.validate()) {
                axios.post("./database/connect",this.database).then((res) => {
                    console.log(res);
                    if (res.data.error) {
                        this.errorSnackBar = true
                        this.errorSnackBarMessage = 'Error en la conexion de la base de datos'
                    }else{
                        this.availableDatabases = res.data.message
                    }
                })
            }
        },
        getDataFromDb(){
            var body = this.database
            body.dbname = this.selectedDb
            body.page = this.options.page
            body.itemsPage = this.options.itemsPerPage
            axios.post("./database/data",body).then((res) => {
                this.itemsEvents = res.data.events
                this.totalEventsItems = res.data.total
            })
        },
        publishRabbit(){
            if(this.$refs.formRabbitMq.validate()){
                axios.post("./rabbit/sync",{rabbit:this.rabbitMqConfig,database:this.database}).then((res)=>{
                    
                })
            }
        }
    }
})