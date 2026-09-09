import React, {FC} from 'react';
import {AdvancedSelect, Box, Button, Input, InputGroupContainer} from 'components';
import {useTheme} from 'styled-components';
import {Search} from 'icons';

const DesignSystem: FC = () => {
  const {spacing} = useTheme();

  return (
    <Box padding={spacing.scale500} display="grid" rowGap={spacing.scale300} paddingTop={104}>
      <InputGroupContainer>
        <AdvancedSelect
          options={[
            {label: 'Alle', value: 'all'},
            {label: 'Vollständiger Name', value: 'Vollständiger Name'},
          ]}
        />
        <Input placeholder="Suchen ..." />
        <Button>
          <Search />
        </Button>
      </InputGroupContainer>
    </Box>
  );
};

export default DesignSystem;
