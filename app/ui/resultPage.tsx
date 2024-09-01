/** @jsxImportSource frog/jsx */
import { Box } from '../api/[[...routes]]/ui'

export function getResultPageImage(symbol: string, tokenAddr: string) {
    return (
        <Box
            grow
            alignVertical="center"
            padding="10"
            paddingBottom="26"
            marginTop="2"
            marginBottom="2"
            fontWeight="900"
            textAlign='center'
        >   
            <img
                src="/Deployed.png"
            />
            <div
                style={{
                    position: 'absolute',
                    display: 'flex',
                    top: 255,
                    left: 450,
                    width: '10%',
                    color: 'white',
                    fontSize: 50,
                    fontWeight: '900',
                    fontFamily: 'Poppins',
                }}
            >
                {symbol}
            </div>
            <div
                style={{
                    position: 'absolute',
                    display: 'flex',
                    top: 395,
                    left: 70,
                    width: '28%',
                    color: 'white',
                    fontSize: 45,
                    fontWeight: '900',
                    fontFamily: 'Poppins',
                }}
            >
                {tokenAddr}
            </div>
        </Box>
    )
}
