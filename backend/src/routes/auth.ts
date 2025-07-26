import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, learning_language } = req.body;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name,
          learning_language: learning_language || 'english'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
    }

    return res.status(201).json({
      message: 'User registered successfully',
      user: authData.user
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name,
        learning_language: profile?.learning_language
      },
      session: data.session
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', async (_req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as authRoutes };