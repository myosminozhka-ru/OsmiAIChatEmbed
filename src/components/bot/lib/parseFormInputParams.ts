export const normalizeFormInputParams = (formInputTypes: any[]) => {
  for (const formInputType of formInputTypes) {
    if (formInputType.type === 'options') {
      formInputType.options = formInputType.addOptions.map((option: any) => ({
        label: option.option,
        name: option.option,
      }));
    }
  }
  return formInputTypes;
};

export const parseStartNodeFormConfig = (startNode: any) => {
  const startInputType = startNode.data.inputs?.startInputType;
  const formInputTypes = startNode.data.inputs?.formInputTypes;

  if (startInputType !== 'formInput' || !formInputTypes?.length) {
    return { startInputType, formInputParams: [] as any[], formTitle: '', formDescription: '' };
  }

  return {
    startInputType,
    formInputParams: normalizeFormInputParams([...formInputTypes]),
    formTitle: startNode.data.inputs?.formTitle ?? '',
    formDescription: startNode.data.inputs?.formDescription ?? '',
  };
};
