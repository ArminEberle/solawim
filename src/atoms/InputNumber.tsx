export type InputNumberProps = {
    label: string;
    min: number;
    max: number;
};

export const InputNumber = (options: InputNumberProps) => (
    <div className="box">
        <div className="input-wrapper">
            <input
                id="input"
                type="number"
                className="form-control"
                placeholder={options.label}
                min={options.min}
                max={options.max}
                width={5}
                step={1}
            />
            <label
                htmlFor="input"
                className="control-label"
            >
                {options.label}
            </label>
        </div>
    </div>
);
