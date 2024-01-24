new Vue({
    el:"#app",
    vuetify: new Vuetify(),
    data:{
        mainView: false,
        csvView: true,
        dbView: false
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
        }
    }
})