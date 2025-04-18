import { GrupoTransacao } from "./GrupoTransacao.js";
import { TipoTransacao } from "./TipoTransacao.js";
import { Transacao } from "./Transacao.js";
import { Armazenador } from "./Armazenador.js";
import { ValidaDebito, ValidaDeposito } from "./Decorators.js";

export class Conta {
    protected nome: string;
    protected saldo: number = Armazenador.obter<number>("saldo") || 0;
    transacoes: Transacao[] = Armazenador.obter<Transacao[]>(("transacoes"), (key: string, value: any) => {
        if(key === "data") {
            return new Date(value);
        }
        return value;
    }) || [];

    constructor(nome: string) {
        this.nome = nome;
    }

    getTitutlar(): string {
        return this.nome;
    }

    getGruposTransacoes(): GrupoTransacao[] {
            const gruposTransacoes: GrupoTransacao[] = [];
            const listaTransacoes: Transacao[] = structuredClone(this.transacoes);
            const transacoesOrdenadas: Transacao[] = listaTransacoes.sort((t1, t2) => t2.data.getTime() - t1.data.getTime());
            let labelAtualGrupoTransacao: string = "";
    
            for (let transacao of transacoesOrdenadas) {
                let labelGrupoTransacao: string = transacao.data.toLocaleDateString("pt-br", { month: "long", year: "numeric" });
                if (labelAtualGrupoTransacao !== labelGrupoTransacao) {
                    labelAtualGrupoTransacao = labelGrupoTransacao;
                    gruposTransacoes.push({
                        label: labelGrupoTransacao,
                        transacoes: []
                    });
                }
                gruposTransacoes.at(-1).transacoes.push(transacao);
            }
    
            return gruposTransacoes;
        }

        getSaldo(): number {
            return this.saldo;
        }

        getDataAcesso(): Date {
            return new Date();
        }
        @ValidaDebito //Decorator para validar o debito, usado no método debitar para validar o valor do debito
        debitar(valor: number): void {
           this.saldo -= valor;
            Armazenador.salvar("saldo", this.saldo.toString());
        }

        @ValidaDeposito //Decorator para validar o deposito, usado no método depositar para validar o valor do deposito
        depositar(valor: number): void {
            this.saldo += valor;
            Armazenador.salvar("saldo", this.saldo.toString());
        }

        registrarTransacao(novaTransacao: Transacao): void {
                if (novaTransacao.tipoTransacao == TipoTransacao.DEPOSITO) {
                    this.depositar(novaTransacao.valor);
                } 
                else if (novaTransacao.tipoTransacao == TipoTransacao.TRANSFERENCIA || novaTransacao.tipoTransacao == TipoTransacao.PAGAMENTO_BOLETO) {
                    this.debitar(novaTransacao.valor);
                    novaTransacao.valor *= -1;
                } 
                else {
                    throw new Error("Tipo de Transação é inválido!");
                }
        
                this.transacoes.push(novaTransacao);
                console.log(this.getGruposTransacoes());
                Armazenador.salvar("transacoes", JSON.stringify(this.transacoes));
            }
}

export class ContaPremium extends Conta {
    constructor(nome: string) {
        super(nome);
    }

    registrarTransacao(transacao: Transacao): void {
        if(transacao.tipoTransacao === TipoTransacao.DEPOSITO) {
            console.log("Parabéns por você ser um cliente premium, você gabhou um bônus de 0.50 centavos!")
                transacao.valor += 0.5;
            }
            super.registrarTransacao(transacao);
        }
    }    
    
const conta  = new Conta("Maicon Douglas Alves de Oliveira");
const contaPremium = new ContaPremium("M.Douglas");

export default conta;