'use strict';
const authService = require('./auth.service');
const apiResponse = require('../../utils/apiResponse');

const register = async (req, res) => {
  const { email, password, role, hub_id } = req.body;
  try {
    const user = await authService.register({ email, password, role, hub_id });
    return apiResponse.success(res, user, 201);
  } catch (err) {
    return apiResponse.error(res, err.message, err.status || 500);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await authService.login({ email, password });
    return apiResponse.success(res, result);
  } catch (err) {
    return apiResponse.error(res, err.message, err.status || 500);
  }
};

const getMe = async (req, res) => {
  const user = await authService.getMe(req.user.user_id);
  if (!user) return apiResponse.error(res, 'User not found.', 404);
  return apiResponse.success(res, user);
};

module.exports = { register, login, getMe };
