import { Request, Response } from 'express';
import { Role } from '../models/role';
import { RoleTypes } from '../types/roleTypes';

//GET
const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await Role.find({ isDelete: false, isActive: true, name: { $not: { $eq: RoleTypes.Admin } } });

    res.send(roles);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      err: 'Hubo un error'
    });
  }
}
const getOneRole = async (req: Request, res: Response) => {
  try {
    const RoleId = req.params.id;
    const role = await Role.findOne({ _id: RoleId, isDelete: false, isActive: true });

    if (!role || role.name === RoleTypes.Admin) {
      res.status(404).send({
        err: 'Rol no encontrado'
      });
      return;
    }

    res.send(role);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      err: 'Hubo un error'
    });
  }
}

//POST
const createNewRole = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (name === RoleTypes.Admin) {
      res.status(400).send({
        err: 'Hubo un error'
      })
      return;
    }

    const newRole = Role.build({
      name
    })

    await newRole.save();

    res.send(newRole);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      err: 'Hubo un error'
    });
  }
}

export { getAllRoles, getOneRole, createNewRole }