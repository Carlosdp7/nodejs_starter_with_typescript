import { Request, Response } from 'express';
import { User, UserDoc } from '../models/user';
import bcrypt from 'bcrypt';
import { RoleTypes } from '../types/roleTypes';
import { Role } from '../models/role';

//GET
const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ isDelete: false, _id: { $not: { $eq: req.user!.id } } }).populate('roleId');

    res.send(users);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      err: 'Hubo un error'
    });
  }
}
const getAuthenticatedUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await User.findOne({ _id: userId, isDelete: false, isActive: true }).populate('roleId');

    if (!user) {
      res.status(404).send({
        err: 'Usuario no encontrado'
      });
      return;
    }

    res.send(user);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      err: 'Hubo un error'
    });
  }
}
const getOneUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId, isDelete: false }).populate('roleId');

    if (!user) {
      res.status(404).send({
        err: 'Usuario no encontrado'
      });
      return;
    }

    res.send(user);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      err: 'Hubo un error'
    });
  }
}
const getRegisteredUsersPerMonth = async (req: Request, res: Response) => {
  try {
    const lte = new Date(`${new Date().getFullYear()}-12-31`);
    const gte = new Date(`${new Date().getFullYear()}-01-01`);

    const monthlyUsers = await User.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $gte: ["$createdAt", gte] },
              { $lte: ["$createdAt", lte] }
            ]
          }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      }
    ]);

    res.send(monthlyUsers);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      err: 'Hubo un error'
    });
  }
}
const getWeeklyRegistersCount = async (req: Request, res: Response) => {
  try {
    const lte = new Date(`${new Date().getFullYear()}-12-31`);
    const gte = new Date(`${new Date().getFullYear()}-01-01`);

    const weeklyUsers = await User.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $gte: ["$createdAt", gte] },
              { $lte: ["$createdAt", lte] }
            ]
          }
        }
      },
      {
        $group: {
          _id: { $week: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          _id: -1
        }
      },
      {
        $limit: 1
      }
    ]);

    res.send(weeklyUsers);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      err: 'Hubo un error'
    });
  }
}
const getAllRegisteredUsers = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.find().countDocuments();

    res.send({ totalUsers });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      err: 'Hubo un error'
    });
  }
}

//POST
const adminSignIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('roleId');

    if (!user) {
      res.status(400).send({
        err: 'Email o contraseña incorrectos'
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(400).send({
        err: 'Email o contraseña incorrectos'
      });
      return;
    }

    if (user.roleId.name !== RoleTypes.Admin) {
      res.status(403).send({
        err: 'No autorizado'
      });
      return;
    }

    const token = User.generateAuthToken(user._id);

    res.send({
      token,
      user
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      err: 'Hubo un error'
    });
  }
}
const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).send({
        err: 'Email o contraseña incorrectos'
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(400).send({
        err: 'Email o contraseña incorrectos'
      });
      return;
    }

    if (user.isDelete) {
      res.status(410).send({
        err: 'Este usuario ha sido eliminado anteriormente'
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).send({
        err: 'Este usuario está deshabilitado'
      });
      return;
    }

    const token = User.generateAuthToken(user._id);

    res.send({
      token,
      user
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      err: 'Hubo un error'
    });
  }
}

const signUp = async (req: Request, res: Response) => {
  try {
    const { firstname, lastname, email, username, password } = req.body;
    let user: UserDoc | null = await User.findOne({ email });
    const role = await Role.findOne({ name: RoleTypes.User })

    if (!role) {
      throw new Error('Role no encontrado');
    }

    if (user) {
      if (!user.isActive) {
        res.status(403).send({
          err: 'Este usuario está deshabilitado'
        });
        return;
      }

      if (user.isDelete) {
        user.set({
          isDelete: false
        });
      }
    } else {
      user = User.build({
        firstname,
        lastname,
        email,
        roleId: role._id,
        username,
        password
      })
    }

    await user.save();

    const token = User.generateAuthToken(user._id);

    res.send({
      token,
      user
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      err: 'Hubo un error'
    });
  }
}
const logOut = async (req: Request, res: Response) => {
  try {
    req.user = {
      id: '',
      role: RoleTypes.User
    }

    res.send();
  } catch (err) {
    console.log(err);
    res.status(500).send({
      err: 'Hubo un error'
    });
  }
}
const createNewUser = async (req: Request, res: Response) => {
  try {
    const { firstname, lastname, email, username, password, isActive } = req.body;
    let user: UserDoc | null = await User.findOne({ email });
    const role = await Role.findOne({ name: RoleTypes.User })

    if (!role) {
      throw new Error('Role no encontrado');
    }

    if (user) {
      if (!user.isActive) {
        res.status(403).send({
          err: 'Este usuario está deshabilitado'
        });
        return;
      }

      if (user.isDelete) {
        user.set({
          isDelete: false
        });
      }
    } else {
      user = User.build({
        firstname,
        lastname,
        roleId: role._id,
        username,
        email,
        password,
        isActive
      })
    }

    await user.save();

    res.send(user);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      err: 'Hubo un error'
    });
  }
}
const passwordRecoveryRequest = async (req: Request, res: Response) => {
  try {
    const email = req.body.email

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).send({
        err: 'Usuario no encontrado'
      });
      return;
    }

    if (user.isDelete) {
      res.status(410).send({
        err: 'Este usuario ha sido eliminado anteriormente'
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).send({
        err: 'Este usuario está deshabilitado'
      });
      return;
    }

    const { resetPasswordToken, resetPasswordExpires } = User.generatePasswordReset();

    user.set({
      resetPasswordToken, resetPasswordExpires
    })

    await user.save();

    //Send recover password email

    res.send();
  } catch (err) {
    console.log(err);
    res.status(500).send({
      err: 'Hubo un error'
    });
  }
}
const verifyPasswordToken = async (req: Request, res: Response) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) {
      res.status(400).send({
        err: 'Token inválido'
      });
      return;
    }

    res.send();
  } catch (err) {
    console.log(err);
    res.status(500).send({
      err: 'Hubo un error'
    });
  }
}
const recoverPassword = async (req: Request, res: Response) => {
  try {
    const newPassword = req.body.password;
    const token = req.params.token;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) {
      res.status(400).send({
        err: 'Token inválido'
      });
      return;
    }

    user.set({
      password: newPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined
    });

    await user.save();

    res.send();
  } catch (err) {
    console.log(err);
    res.status(500).send({
      err: 'Hubo un error'
    });
  }
}

//PUT
const updateAuthorizedUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await User.findOne({ _id: userId, isDelete: false, isActive: true });

    if (!user) {
      res.status(404).send({
        err: 'Usuario no encontrado'
      });
      return;
    }

    user.set(req.body);

    await user.save();

    res.send(user);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      err: 'Hubo un error'
    });
  }
}
const updateOneUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId, isDelete: false });

    if (!user) {
      res.status(404).send({
        err: 'Usuario no encontrado'
      });
      return;
    }

    user.set(req.body);

    await user.save();

    res.send(user);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      err: 'Hubo un error'
    });
  }
}
const updateAuthorizedUserPassword = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ _id: req.user!.id, isDelete: false, isActive: true });
    const { newPassword, currentPassword } = req.body;

    if (!user) {
      res.status(404).send({
        err: 'Usuario no encontrado'
      });
      return
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      res.status(400).send({
        err: 'Contraseña incorrecta'
      });
      return;
    }

    user.set({
      password: newPassword
    });

    await user.save();

    res.send(user);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      err: 'Hubo un error'
    });
  }
}
//DELETE
const deleteOneUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId, isDelete: false });

    if (!user) {
      res.status(404).send({
        err: 'Usuario no encontrado'
      });
      return;
    }

    user.set({
      isDelete: true
    });

    await Promise.all([user.save()]);

    res.send(user);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      err: 'Hubo un error'
    });
  }
}

export {
  getAllUsers,
  getAuthenticatedUser,
  getOneUser,
  getRegisteredUsersPerMonth,
  getWeeklyRegistersCount,
  getAllRegisteredUsers,
  adminSignIn,
  signIn,
  signUp,
  logOut,
  createNewUser,
  passwordRecoveryRequest,
  verifyPasswordToken,
  recoverPassword,
  updateAuthorizedUser,
  updateOneUser,
  updateAuthorizedUserPassword,
  deleteOneUser
}