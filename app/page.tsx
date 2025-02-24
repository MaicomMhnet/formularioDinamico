"use client"
import { useState } from 'react';
import * as uuid from "uuid"

import axios from 'axios';
import { Button, Card, CardBody, CardHeader, Checkbox, Input, Select, SelectItem } from '@heroui/react';

type Option = {
  id: string;
  value: string;
  label: string;
};

type Props = {
  id: string;
  type: string;
  labelText: string;
  length: number;
  options: Option[];
};

function Create() {
  const inputTypes: { [key: string]: string } = {
    "MULTIPLE_OPTION": "option",
    "TEXT": "text",
    "SELECT": "select",
    "TEXTAREA": "textarea",
    "TEXT_EMAIL": "email",
    "TEXT_PASSWORD": "password",
    "DATE": "date",
    "TIME": "time",
  };

  const [inputs, setInputs] = useState<Props[]>([
    {
      id: uuid.v4(),
      type: "",
      labelText: "",
      length: 100,
      options: []
    }
  ]);

  const [formData, setFormData] = useState<{ [key: string]: any }>({})
  const [formType, setFormType] = useState<string>("")

  const addField = () => {
    setInputs([...inputs, {
      id: uuid.v4(),
      type: "",
      labelText: "",
      length: 100,
      options: []
    }])
  }

  const showData = async () => {
    const formObject = {
      id: uuid.v4(),
      formType,
      inputs,
      formData
    };

    console.log(formObject)

    try {
      const response = await axios.post("/api/formulario/salva", formObject, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Data sent successfully:', response.data)
    } catch (error) {
      console.log('Error sending data:', error)
    }
  }

  const handlerDataEachField = (index: number, key: string, value: any) => {
    const fields = [...inputs];
    fields[index][key] = value;
    setInputs(fields);
  }

  const handlerDataEachOption = (indexParent: number, indexOption: number, value: any) => {
    const fields = [...inputs];
    fields[indexParent].options[indexOption] = { ...fields[indexParent].options[indexOption], value, label: value };
    setInputs(fields);
  }

  const deleteField = (index: number) => {
    const fields = [...inputs];
    fields.splice(index, 1);
    setInputs(fields);
  }

  const deleteFieldOption = (indexParent: number, indexOption: number) => {
    const fields = [...inputs];
    fields[indexParent].options.splice(indexOption, 1);
    setInputs(fields);
  }

  const addOptionToSpecificField = (index: number) => {
    const fields = [...inputs];
    fields[index].options.push({ id: uuid.v4(), value: "", label: "" });
    setInputs(fields);
  }

  const isExistInputs = () => {
    return inputs.length > 0;
  }

  const renderOptions = (item: Props, index: number) => {
    if (item.type !== "SELECT" && item.type !== "MULTIPLE_OPTION") {
      return null;
    }

    return (
      <div>
        <label>
          Opções?
        </label>
        <br />
        <Button className="mb-2" onPress={() => addOptionToSpecificField(index)}>
          Adicionar nova opção
        </Button>

        {item.options.map((option, indexOption) => {
          return (
            <div key={option.id} className='grid grid-cols-2 py-2 gap-3'>              
              <div>
                <Input
                  value={option.value}
                  onChange={(event) => handlerDataEachOption(index, indexOption, event.target.value)}
                />
              </div>
              <div className='flex justify-between w-full '>
                <Checkbox defaultSelected color="warning">
                  Item Obrigatório ?
                </Checkbox>
                <Button color="danger" onPress={() => deleteFieldOption(index, indexOption)}>Remover</Button>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderTypeOptions = () => {
    return Object.keys(inputTypes).map(key => {
      return (
        <SelectItem key={key} value={key}>
          {inputTypes[key]}
        </SelectItem>
      )
    })
  }

  const getKeyField = (label: string) => {
    return label.replace(/[?]/g, "").replace(/\s/g, "_").toLowerCase()
  }

  const handlerFormData = (key: string, value: any) => {
    setFormData({
      ...formData,
      [key]: value
    })
  }

  return (
    <div className='w-[30%] mx-auto'>
      <div>
        <h1 className="text-center font-semibold text-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-transparent bg-clip-text">
          Cadastro de Questionário
        </h1>

      </div>
      <form>
        <br />
        <label>
          Título de Relatório
        </label>
        <div className='py-3'>
          <Input
            id="formType"
            name="formType"
            type="text"
            value={formType}
            onChange={(event) => setFormType(event.target.value)}
          />
        </div>
        {isExistInputs() &&
          inputs.map((item, index) => {
            return (
              <Card className="mb-2" key={item.id}>
                <CardHeader style={{ margin: "5px" }}>
                  <Button onPress={() => deleteField(index)}>
                    Remover
                  </Button>
                </CardHeader>
                <CardBody>
                  <div>
                    <label>
                      Qual tipo de campo?
                    </label>
                    <Select
                      id="type"
                      name="select"
                      value={item.type}
                      onChange={(event) => handlerDataEachField(index, "type", event.target.value)}
                    >
                      {renderTypeOptions()}
                    </Select>
                  </div>
                  <div>
                    <label>
                      Qual texto da label?
                    </label>
                    <Input
                      id="label"
                      name="text"
                      type="text"
                      value={item.labelText}
                      onChange={(event) => handlerDataEachField(index, "labelText", event.target.value)}
                    />
                  </div>
                  {renderOptions(item, index)}
                </CardBody>
              </Card>
            )
          })
        }
      </form>
      <div className='flex justify-between'>
        <div className='flex gap-3'>
          <Button color='primary' onPress={() => addField()}>Adicionar novo campo</Button>
          <Button color='warning' onPress={() => showData()}>Preview</Button>
        </div> 
        <Button color='success' onPress={() => showData()}>Salvar questionário</Button>
      </div>
      {/* <div> */}
        {/* <h1>Preview form</h1> */}
        {/* <PreviewForm
          inputs={inputs} formData={{}}
          getKeyField={getKeyField}
          handlerFormData={handlerFormData}
        /> */}
      {/* </div> */}
    </div>
  );
}

export default Create;