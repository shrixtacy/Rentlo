// auth.controller.js
export const getauths = async (req, res, next) => {
    try {
        res.status(200).json({ success: true, message: 'auth controller ready' });
    } catch (error) {
        next(error);
    }
};
