import { Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../types';

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const { data: user, error } = await supabase.auth.getUser(token);
    
    if (error || !user.user) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single();

    req.user = {
      id: user.user.id,
      email: user.user.email!,
      name: profile?.name || '',
      learning_language: profile?.learning_language || 'english',
      created_at: user.user.created_at,
      updated_at: user.user.updated_at || user.user.created_at
    };

    return next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};