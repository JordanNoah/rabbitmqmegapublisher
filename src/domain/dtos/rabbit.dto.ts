export class RabbitDto {
    private constructor(
       public username: string,
       public password: string,
       public protocol: string,
       public hostname: string,
       public port: number,
       public vhost: string,
       public queue: string,
       public exchange: string,
       public routingKey: string,
       public typeExchange: string
    ) {}

    static create(object:{[key:string]:any}):[string, undefined] | [undefined, RabbitDto]{
        const {
            username,
            password,
            protocol,
            hostname,
            port,
            vhost,
            queue,
            exchange,
            routingKey,
            typeExchange
        } = object

        if (!username) return ['Missing argument username rabbit', undefined]
        if (!password) return ['Missing argument password rabbit', undefined]
        if (!protocol) return ['Missing argument protocol rabbit', undefined]
        if (!hostname) return ['Missing argument hostname rabbit', undefined]
        if (!port) return ['Missing argument port rabbit', undefined]
        if (!vhost) return ['Missing argument vhost rabbit', undefined]
        if (!queue) return ['Missing argument queue rabbit', undefined]
        if (!exchange) return ['Missing argument exchange rabbit', undefined]
        if (!routingKey) return ['Missing argument routing key rabbit', undefined]
        if (!typeExchange) return ['Missing argument type exchange rabbit', undefined]

        return [
            undefined,
            new RabbitDto(
                username!,
                password!,
                protocol!,
                hostname!,
                port!,
                vhost!,
                queue!,
                exchange!,
                routingKey!,
                typeExchange!
            )
        ]
    }
}