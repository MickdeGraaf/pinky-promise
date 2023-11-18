import React, { ReactNode } from "react";
import { Box } from "@chakra-ui/layout";

interface ContainerProps {
  children: ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <Box m="5">
      {children}
    </Box>
  );
};

export default Container;
