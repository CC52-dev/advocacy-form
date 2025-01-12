const log = async (message) => {
    try {
        console.log(`[Server Log]: ${message}`)
    } catch (error) {
        console.error('Logging error:', error)
    }
}

export default log
