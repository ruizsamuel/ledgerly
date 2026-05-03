import { compare, genSalt, hash } from "bcrypt";
import { PASSWORD_MIN_LENGTH } from "../common/utils/auth.utils.js";
import { DEMO_EMAIL } from "../domain/constants/demo-data.js";
import { userRepository } from "../repositories/user.repository.js";
import { settingsRepository } from "../repositories/settings.repository.js";
import { demoUserService } from "./demo-user.service.js";
import type { ChangePasswordInput, LoginInput, RegisterInput, User } from "../domain/models/user.model.js";

export const authService = {
  async login(input: LoginInput) {
    const userDoc = await userRepository.findByEmailWithPassword(input.email);
    if (!userDoc || !userDoc.password) {
      throw new Error("invalidCredentials");
    }

    const match = await compare(input.password, userDoc.password);
    if (!match) throw new Error("invalidCredentials");

    // If this is demo user login, reset data with fresh mock data
    if (input.email === DEMO_EMAIL) {
      const isDemoEnabled = await demoUserService.isDemoUserEnabled();
      if (!isDemoEnabled) {
        throw new Error("invalidCredentials");
      }
      await demoUserService.resetDemoUserData();
    }

    return userRepository.findById(userDoc.id.toString());
  },

  async register(input: RegisterInput) {
    const userCount = await userRepository.countAll();

    if (userCount > 0) {
      const settings = await settingsRepository.get();
      if (!settings?.allowUserRegistration) {
        throw new Error("registrationDisabled");
      }
    }

    if (input.password.length < PASSWORD_MIN_LENGTH) {
      throw new Error("passwordMinLength");
    }

    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw new Error("emailInUse");

    const salt = await genSalt(10);
    const hashedPassword = await hash(input.password, salt);

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      isAdmin: userCount === 0
    });

    if (user?.isAdmin) {
      await settingsRepository.upsert({ allowUserRegistration: false, allowDemoUser: true });
      await demoUserService.createDemoUser();
    }

    return user;
  },

  async changePassword(user: User, input: ChangePasswordInput) {
    const userDoc = await userRepository.findByIdWithPassword(user.id);
    if (!userDoc || !userDoc.password) {
      throw new Error("userNotFound");
    }

    const match = await compare(input.currentPassword, userDoc.password);
    if (!match) {
      throw new Error("incorrectPassword");
    }

    if (input.newPassword.length < PASSWORD_MIN_LENGTH) {
      throw new Error("passwordMinLength");
    }

    const salt = await genSalt(10);
    const hashedPassword = await hash(input.newPassword, salt);

    await userRepository.updatePassword(user.id, hashedPassword);
  }
};
