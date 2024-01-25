export class StudentDto{
    private constructor(
        public name: string,
        public lastname: string,
        public uuidStudent: string,
        public state: string
    ){}

    static create(object:{
        Nombre: string;
        Apellido: string;
        'UUID Alumno': string;
    }):[string?,StudentDto?]{        
        const {
            Nombre,
            Apellido,
            'UUID Alumno': uuidStudent
        } = object

        return[
            undefined,
            new StudentDto(
                Nombre,
                Apellido,
                uuidStudent,
                'notSended'
            )
        ]
    }
}