import { Box, Flex, Stack } from '@chakra-ui/layout';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link as ReactRouterLink } from 'react-router-dom'
import { Link as ChakraLink, LinkProps } from '@chakra-ui/react'

export const HeaderMenu = () => {
    return (
        <Flex p="5">
            <Flex grow={1}>
                <Stack direction="row" spacing={4} align="center">
                    <Box>🤙 Pinky Promise</Box>
                    <Box>
                        <ChakraLink as={ReactRouterLink} to='/'>
                            Borrow
                        </ChakraLink>
                    </Box>
                    <Box>
                        <ChakraLink as={ReactRouterLink} to='/lend'>
                            Lend
                        </ChakraLink>
                    </Box>
                    <Box>
                        <ChakraLink as={ReactRouterLink} to='/verify'>
                            Verify
                        </ChakraLink>
                    </Box>
                </Stack>
            </Flex>

            <Stack
                justify={'flex-end'}
                direction={'row'}
                spacing={6}
            >
                <ConnectButton />
            </Stack>
        </Flex>

    )
}