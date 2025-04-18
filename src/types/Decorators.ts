// Define um decorator de método chamado ValidaDebito
export function ValidaDebito(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Guarda uma referência ao método original
    const originalMethod = descriptor.value;

        descriptor.value = function (valorDoDebto: number) {
            if (valorDoDebto <= 0) {
                throw new Error("Valor do debito precisa ser maior que zero!");
            }

            if (valorDoDebto > this.saldo) {
                throw new Error("Valor do debito maior que o saldo!");
            }

            return originalMethod.apply(this, [valorDoDebto]);
        }

        return descriptor;
}

export function ValidaDeposito(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (valorDoDepsoito:number) {
        if(valorDoDepsoito <= 0) {
            throw new Error("Valor do deposito precisa ser maior que zero!");
        }
        return originalMethod.apply(this, [valorDoDepsoito])
    }

    return descriptor;
}