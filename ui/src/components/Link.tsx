import { Link as ReactRouterLink } from 'react-router-dom'
import { Link as ChakraLink, LinkProps } from '@chakra-ui/react'

interface MyLinkProps {
    to:string;
    children:React.ReactNode;
}

const Link = ({ to, children }: MyLinkProps) => {
    return (
        <ChakraLink as={ReactRouterLink} to={to}>
            {children}
        </ChakraLink>
    )
}

export default Link;