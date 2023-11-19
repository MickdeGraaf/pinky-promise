import { Box, Flex, Stack, Text } from '@chakra-ui/layout';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link as ReactRouterLink } from 'react-router-dom'
import { Link as ChakraLink, LinkProps } from '@chakra-ui/react'

export const HeaderMenu = () => {
    return (
        <Flex p="5">
            <Flex grow={1}>
                <Stack direction="row" spacing={4} align="center">
                    <Box><Text fontSize={"1.5em"}>🤙 Pinky Promise</Text></Box>
                    <Box>
                        <ChakraLink as={ReactRouterLink} to='/'>
                            Bonds
                        </ChakraLink>
                    </Box>
                    <Box>
                        <ChakraLink as={ReactRouterLink} to='/lend'>
                            Orders
                        </ChakraLink>
                    </Box>
                    <Box>
                        {/* <ChakraLink as={ReactRouterLink} to='/verify'>
                            Verify
                        </ChakraLink> */}
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