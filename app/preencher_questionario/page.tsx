"use client"
import { Button, Checkbox, DateInput, DatePicker, Input, Select, SelectItem, Textarea } from "@heroui/react";
import axios from "axios";
import { useEffect, useState } from "react";

export default function AboutPage() {
  const [questionario, setQuestionarios] = useState<any[]>([]);
  const [idRelatorio, setIdRelatorio] = useState<string>("");
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<any>(null);
  const [respostas, setRespostas] = useState<any>({});

  const buscaRelatorios = async () => {
    const relatorios = await axios.get('/api/formulario/busca_relatorios');
    setQuestionarios(relatorios.data);
  };

  useEffect(() => {
    buscaRelatorios();
  }, []);

  const relatorioSelect = async (id: string) => {
    const relatorios = await axios.post('/api/formulario/busca_relatorios_id', { id });
    setRelatorioSelecionado(relatorios.data);
    setIdRelatorio(id); // Armazena o id do relatório selecionado
    setRespostas({});
  };

  const handleInputChange = (id: string, value: any) => {
    setRespostas((prevRespostas: any) => ({
      ...prevRespostas,
      [id]: value
    }));
  };

  const handleCheckboxChange = (id: string, value: any) => {
    // Se a resposta for um array (checkbox), adiciona ou remove a opção selecionada
    setRespostas((prevRespostas: any) => {
      const currentValues = prevRespostas[id] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v: any) => v !== value) // Remove a opção
        : [...currentValues, value]; // Adiciona a opção
      return { ...prevRespostas, [id]: newValues };
    });
  };

  const handleSubmit = async () => {
    // Prepara os dados para envio com os IDs das perguntas e suas respectivas respostas
    const dadosParaSalvar = [];

    // Para cada pergunta, pega a resposta (text, select, checkbox, etc.)
    Object.keys(respostas).forEach((key) => {
      const resposta = respostas[key];

      // Verificar tipo de resposta e associar o ID da pergunta
      if (typeof resposta === 'boolean') {
        // Se a resposta for um checkbox (única escolha)
        dadosParaSalvar.push({
          id_pergunta: key,  // ID da pergunta
          id_formulario: idRelatorio, // ID do relatório
          resposta_boolean: resposta // Valor da resposta (booleano)
        });
      } else if (typeof resposta === 'string') {
        // Se a resposta for texto (input ou textarea)
        dadosParaSalvar.push({
          id_pergunta: key,  // ID da pergunta
          id_formulario: idRelatorio, // ID do relatório
          resposta: resposta // Resposta textual
        });
      } else if (Array.isArray(resposta)) {
  // Se for um array (checkboxes múltiplos)
  const inputRef = perguntasAgrupadas.find((input) => input.id_pergunta === key);
  if (inputRef) {
    const opcoesSelecionadas = inputRef.opcoes.filter((opcao) => resposta.includes(opcao.value));
    dadosParaSalvar.push({
      id_pergunta: key,
      id_formulario: idRelatorio,
      resposta: opcoesSelecionadas.map((opcao) => opcao.label).join(', ')
    });
  }
} else {
  // Para SELECT, precisamos buscar o label da opção escolhida
  const inputRef = perguntasAgrupadas.find((input) => input.id_pergunta === key);
  if (inputRef) {
    const opcaoSelecionada = inputRef.opcoes.find((opcao) => opcao.value === resposta);
    dadosParaSalvar.push({
      id_pergunta: key,
      id_formulario: idRelatorio,
      resposta: opcaoSelecionada ? opcaoSelecionada.label : resposta // Salva o label se existir
    });
  } else {
    // Caso seja apenas um input de texto normal
    dadosParaSalvar.push({
      id_pergunta: key,
      id_formulario: idRelatorio,
      resposta
    });
  }
}

    });

    try {
      // Envia as respostas ao backend com os IDs das perguntas
      const response = await axios.post('/api/formulario/salva_respostas', { respostas: dadosParaSalvar });
      console.log('Respostas enviadas com sucesso:', response.data);
    } catch (error) {
      console.error('Erro ao enviar respostas:', error);
    }
  };

  const idSrelatorios = questionario.map((question: any) => ({
    id: question.id,
    titulo: question.titulo
  }));

  const agruparPerguntas = (perguntas: any[]) => {
    const perguntasAgrupadas: any = {};

    perguntas.forEach((pergunta) => {
      if (!perguntasAgrupadas[pergunta.pergunta]) {
        perguntasAgrupadas[pergunta.pergunta] = {
          tipo: pergunta.tipo,
          opcoes: [],
          id_pergunta: pergunta.id // Armazenar o ID da pergunta
        };
      }
      if (pergunta.opcao) {
        perguntasAgrupadas[pergunta.pergunta].opcoes.push({
          id: pergunta.id_pergunta,
          label: pergunta.opcao,
          value: pergunta.opcao
        });
      }
    });

    return Object.keys(perguntasAgrupadas).map((pergunta) => ({
      pergunta,
      tipo: perguntasAgrupadas[pergunta].tipo,
      opcoes: perguntasAgrupadas[pergunta].opcoes,
      id_pergunta: perguntasAgrupadas[pergunta].id_pergunta // Incluir o ID da pergunta
    }));
  };

  const perguntasAgrupadas = relatorioSelecionado ? agruparPerguntas(relatorioSelecionado) : [];
  console.log("🚀 ~ AboutPage ~ perguntasAgrupadas:", perguntasAgrupadas)

  
  return (
    <div className="w-[30%] mx-auto">
      <h1 className="text-center font-semibold text-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-transparent bg-clip-text py-6">
        Preencher Questionário
      </h1>

      <Select placeholder="Selecione o Relatório a Preencher" onChange={(event) => relatorioSelect(event.target.value)}>
        {idSrelatorios.map((relatorio: any) => (
          <SelectItem key={relatorio.id} value={relatorio.id}>
            {relatorio.titulo}
          </SelectItem>
        ))}
      </Select>

      {relatorioSelecionado && (
        <div className="pt-6 w-full" key={relatorioSelecionado[0].id_formulario}>
          <h2 className="py-6 text-2xl text-center">{relatorioSelecionado[0].titulo}</h2>
          <div className="flex flex-col gap-5 w-full">
            {perguntasAgrupadas.map((input: any, index: number) => (
              <div key={index}>
                <label>{input.pergunta}</label>
                {input.tipo === "TEXT" && (
                  <Input placeholder={input.pergunta} type="text" onChange={(e) => handleInputChange(input.id_pergunta, e.target.value)} />
                )}
                {input.tipo === "TEXTAREA" && (
                  <Textarea placeholder={input.pergunta} onChange={(e) => handleInputChange(input.id_pergunta, e.target.value)} />
                )}
                {input.tipo === "DATE" && (
                  <DatePicker placeholder={input.pergunta} onChange={(e) => handleInputChange(input.id_pergunta, e.target.value)} />
                )}
                {input.tipo === "SELECT" && (
                  <Select placeholder={input.pergunta} onChange={(e) => handleInputChange(input.id_pergunta, e.target.value)}>
                    {input.opcoes.map((option: any) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}
                {input.tipo === "MULTIPLE_OPTION" && (
                  <div>
                    <p className="pb-2">{input.pergunta}</p>
                    {input.opcoes.map((option: any) => (
                      <div key={option.id}>
                        <Checkbox
                          type="checkbox"
                          id={option.id}
                          value={option.value}
                          onChange={() => handleCheckboxChange(input.id_pergunta, option.value)} // Mudança para adicionar/remover
                        />
                        <label htmlFor={option.id}>{option.label}</label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {relatorioSelecionado && (
        <div className="pt-4 flex justify-end">
          <Button color="success" onPress={handleSubmit}>Salvar</Button>
        </div>
      )}
    </div>
  );
}
