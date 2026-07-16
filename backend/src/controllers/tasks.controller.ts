import Redis from "ioredis"
import { Task } from "../models/Task";
import {Request, Response} from 'express'

const redis = new Redis(process.env.REDIS_URL || 'redis://cache:6379');
const CACHE_KEY = 'tasks_list'; 

export const tasksController = {

    async getAll(req: Request, res: Response){

        try{

            const cachedTasks = await redis.get(CACHE_KEY);
            if(cachedTasks){
                return res.json({
                    source: 'Кеш (Redis)',
                    data: JSON.parse(cachedTasks)
                })
            }

            const tasks = await Task.find().sort({deadline: 1});

            await redis.setex(CACHE_KEY, 10, JSON.stringify(tasks));

            return res.json({
                source: 'БД (MongoDB)',
                data: tasks
            })

        }catch(error){
            return res.status(500).json({error: 'Помилка при отриманні тасок'})
        }

    },

    async create(req: Request, res: Response){
        
        try{
            const {title, description,deadline} = req.body;

            if(!title || !deadline){
                return res.status(400).json({error: "Назва та дедлайн обов'язкові"})
            }

            const newTask = new Task({
                title,
                description,
                deadline: new Date(deadline)
            });
            await newTask.save();

            await redis.del(CACHE_KEY);
            
            return res.status(201).json(newTask);

        }catch(error){
            return res.status(500).json({error: 'Помилка при створенні таски'})
        }
    }

}