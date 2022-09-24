const criaRecebivel = async (valor, dataPagamento, metodoPagamento) => {
  const Recebivel = require("../models/Recebivel");

  const [novoValor, novaDataPagamento, status] = defineRegras(valor, dataPagamento, metodoPagamento);

  const recebivel = await Recebivel.create({
    valor: novoValor,
    dataPagamento: novaDataPagamento,
    status
  });
};

const defineRegras = (valor, dataPagamento, metodoPagamento) => {
  if (metodoPagamento === "credit_card") {
    const novaDataPagamento = dataPagamento.setDate(dataPagamento.getDate() + 30);

    return [valor * 0.95, novaDataPagamento, "waiting_funds"];
  }
  else return [valor * 0.97, dataPagamento, "paid"];
}


const retornaSaldo = async () => {
  const sequelize = require("sequelize");
  const Recebivel = require("../models/Recebivel");

  const available = await Recebivel.findAll({
    attributes: [[sequelize.fn("sum", sequelize.col("valor")), "total"]],
    where: {
      "status": "paid"
    }
  });

  const waitingFunds = await Recebivel.findAll({
    attributes: [
      [sequelize.fn("sum", sequelize.col("valor")), "total"],
      "dataPagamento"
    ],
    where: {
      "status": "waiting_funds"
    },
    group: "dataPagamento"
  });

  return { available, waitingFunds };
};

module.exports = { criaRecebivel, retornaSaldo };