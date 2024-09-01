/** @jsxImportSource frog/jsx */
import { Box } from '../api/[[...routes]]/ui'
import { State } from '../api/[[...routes]]/route'

export function getDeployPageImage(tokenInfo: State) {
    return (
        <Box
            grow
            alignVertical="center"
            padding="10"
            paddingBottom="26"
            marginTop="2"
            marginBottom="2"
            fontWeight="700"
        >   
            <img
                src="/Deploy.png"
            />
            {_renderTokenData(tokenInfo)}
        </Box>
    )
}

function _renderTokenData(tokenInfo: State) {
    return (
        <div
            style={{
                position: 'absolute',
                display: 'flex',
                top: 195,
                left: 600,
                width: '28%',
                color: 'white',
                fontSize: 30,
                fontWeight: 900,
                fontFamily: 'Poppins',
            }}
        >
            <div
                style={{
                    flexDirection: 'column',
                    display: 'flex',
                    padding: 10,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <div>{tokenInfo.name}</div>
                    <div>{tokenInfo.symbol}</div>
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '200%',
                    }}
                > 
                    <div>{tokenInfo.description}</div>
                    <div>{tokenInfo.link}</div>
                </div>
                
            </div>
        </div>
    )
    
}