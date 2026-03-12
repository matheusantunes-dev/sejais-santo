import type { ChangeEvent } from "react";
import type { ShareTemplate } from "../share/shareTemplates";
import "./ShareTemplatePicker.css";

interface ShareTemplatePickerProps {
  heading: string;
  helperText: string;
  templates: ShareTemplate[];
  selectedTemplateId: string | null;
  customFileName: string;
  onTemplateSelect: (template: ShareTemplate) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  fileInputId: string;
}

export function ShareTemplatePicker({
  heading,
  helperText,
  templates,
  selectedTemplateId,
  customFileName,
  onTemplateSelect,
  onFileChange,
  fileInputId,
}: ShareTemplatePickerProps) {
  const usingCustomImage = selectedTemplateId === null && Boolean(customFileName);

  return (
    <div className="share-template-picker">
      <div className="share-template-picker__text">
        <h4>{heading}</h4>
        <p>{helperText}</p>
      </div>

      <div className="share-template-picker__grid">
        {templates.map((template) => {
          const isSelected = template.id === selectedTemplateId;

          return (
            <button
              key={template.id}
              type="button"
              className={`share-template-picker__option${isSelected ? " is-selected" : ""}`}
              onClick={() => onTemplateSelect(template)}
            >
              <span
                className="share-template-picker__thumb"
                style={{ backgroundImage: `url(${template.src})` }}
              />
              <span className="share-template-picker__name">{template.name}</span>
            </button>
          );
        })}
      </div>

      <div className={`share-template-picker__upload${usingCustomImage ? " is-active" : ""}`}>
        <div className="share-template-picker__upload-copy">
          <span>Galeria do celular</span>
          <small>{usingCustomImage ? customFileName : "Use uma imagem sua como fundo."}</small>
        </div>

        <label className="share-template-picker__upload-button" htmlFor={fileInputId}>
          Escolher imagem
        </label>

        <input
          id={fileInputId}
          className="share-template-picker__input"
          type="file"
          accept="image/*"
          onChange={onFileChange}
        />
      </div>
    </div>
  );
}
