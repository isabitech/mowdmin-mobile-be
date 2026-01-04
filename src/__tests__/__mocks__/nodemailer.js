export default {
    createTransport: () => ({
        sendMail: () => Promise.resolve(true),
    }),
};
