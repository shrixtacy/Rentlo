// payment.controller.js
export const getpayments = async (req, res, next) => {
    try {
        res.status(200).json({ success: true, message: 'payment controller ready' });
    } catch (error) {
        next(error);
    }
};
