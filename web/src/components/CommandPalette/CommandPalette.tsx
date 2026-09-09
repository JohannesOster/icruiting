import React, {ComponentType, FC, useEffect, useRef, useState} from 'react';
import {Input, Typography} from 'components';
import {useTheme} from 'styled-components';
import {Container, Modal, Suggestions, CommandItem} from './CommandPalette.sc';
import {Enter} from 'icons';
import {Box} from 'components';

type Cmd = {id: string; label: string; icon?: ComponentType<any>};
type Props = {commands: Cmd[]; onSelect: (cmd: Cmd) => void};

export const CommandPalette: FC<Props> = ({commands, onSelect}) => {
  if (!commands.length) return <></>;
  const {colors, spacing, borders} = useTheme();

  const fieldRef = useRef<HTMLInputElement>(null);
  const [fields, setFields] = useState(commands);
  const [selectedFieldId, setSelectedFieldId] = useState(commands[0].id);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target;
    const filteredFields = commands.filter((field) => {
      return field.label.toLowerCase().includes(value.toLowerCase());
    });

    if (!filteredFields.map(({id}) => id).includes(selectedFieldId)) {
      if (filteredFields.length > 0) setSelectedFieldId(filteredFields[0].id);
    }

    setFields(filteredFields);
  };

  const idxOfSelectedField = fields.findIndex((field) => field.id === selectedFieldId);

  const onKey = (event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        let newFieldIdx = Math.min(fields.length - 1, idxOfSelectedField + 1);
        let newFieldId = fields[newFieldIdx].id;
        return setSelectedFieldId(fields[newFieldIdx].id);
      case 'ArrowUp':
        event.preventDefault();
        newFieldIdx = Math.max(0, idxOfSelectedField - 1);
        newFieldId = fields[newFieldIdx].id;
        return setSelectedFieldId(newFieldId);
      case 'Enter':
        event.preventDefault();
        onSelect(fields[idxOfSelectedField]);
      case 'Escape':
        event.preventDefault();
        onSelect(null);
        return;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  });

  return (
    <Container>
      <Modal>
        <Input ref={fieldRef} placeholder="Formularfeld" onChange={onChange} autoFocus={true} />
        <Suggestions>
          {fields.map(({icon, label, id}) => {
            const Icon = icon || (() => <></>);
            return (
              <CommandItem
                key={label}
                isSelected={selectedFieldId === id}
                onClick={() => onSelect(fields[idxOfSelectedField])}
              >
                <Box
                  display="flex"
                  gap={spacing.scale200}
                  alignItems="center"
                  padding={spacing.scale100}
                >
                  <Icon />
                  {label}
                </Box>
                {selectedFieldId === id && (
                  <Box
                    display="flex"
                    gap={spacing.scale100}
                    alignItems="center"
                    background={colors.surfaceSubdued}
                    border="1px solid"
                    borderColor={colors.borderSubdued}
                    padding={spacing.scale100}
                    borderRadius={borders.radius100}
                  >
                    <Typography kind="secondary" color="primary">
                      Enter
                    </Typography>
                    <Enter />
                  </Box>
                )}
              </CommandItem>
            );
          })}
        </Suggestions>
      </Modal>
    </Container>
  );
};
