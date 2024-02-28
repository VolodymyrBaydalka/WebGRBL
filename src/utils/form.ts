export function getFormValue(form: HTMLFormElement) {
    const result: Record<string, any> = {};

    for (let el of form.elements) {
        if (el instanceof HTMLInputElement) {
            switch (el.type) {
                case "number":
                case "range":
                    result[el.name] = el.valueAsNumber;
                    break;

                case "checkbox":
                    result[el.name] = el.checked;
                    break;

                case "file":
                    result[el.name] = el.multiple ? [...el.files!] : el.files![0];
                    break;
    
                default:
                    result[el.name] = el.value;
                    break;
            }
        } else if (el instanceof HTMLSelectElement) {
            if (el.multiple) {
                result[el.name] = [...el.selectedOptions].map(x => x.value);
            } else {
                result[el.name] = el.selectedOptions[0]?.value;
            }
        }
    }

    return result;
}