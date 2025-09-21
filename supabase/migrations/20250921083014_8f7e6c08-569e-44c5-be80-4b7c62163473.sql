-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'chairman',
  department TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'chairman')
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create travel management table
CREATE TABLE public.travel_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE NOT NULL,
  purpose TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  budget_amount DECIMAL(10,2),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.travel_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view travel requests" ON public.travel_requests FOR SELECT USING (true);
CREATE POLICY "Users can create travel requests" ON public.travel_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their travel requests" ON public.travel_requests FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IN (SELECT user_id FROM profiles WHERE role IN ('chairman', 'head-of-operations')));

-- Create fleet management table
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  license_plate TEXT UNIQUE NOT NULL,
  vin TEXT UNIQUE,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in-use', 'maintenance', 'retired')),
  driver_assigned UUID REFERENCES auth.users(id),
  last_service_date DATE,
  next_service_date DATE,
  mileage INTEGER DEFAULT 0,
  fuel_type TEXT,
  insurance_expiry DATE,
  registration_expiry DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view vehicles" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Fleet managers can manage vehicles" ON public.vehicles FOR ALL USING (auth.uid() IN (SELECT user_id FROM profiles WHERE role IN ('chairman', 'fleet-manager', 'head-of-operations')));

-- Create house management table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT DEFAULT 'residential' CHECK (type IN ('residential', 'commercial', 'office', 'vacation')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'renovation', 'inactive')),
  manager_id UUID REFERENCES auth.users(id),
  address TEXT,
  size_sqft INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  amenities TEXT[],
  monthly_expenses DECIMAL(10,2),
  last_inspection DATE,
  next_inspection DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view properties" ON public.properties FOR SELECT USING (true);
CREATE POLICY "House managers can manage properties" ON public.properties FOR ALL USING (auth.uid() IN (SELECT user_id FROM profiles WHERE role IN ('chairman', 'house-manager-muscat', 'head-of-operations')));

-- Create operational checklists table
CREATE TABLE public.checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  due_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'overdue')),
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view checklists" ON public.checklists FOR SELECT USING (true);
CREATE POLICY "Users can create checklists" ON public.checklists FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Assigned users can update checklists" ON public.checklists FOR UPDATE USING (auth.uid() = assigned_to OR auth.uid() = created_by OR auth.uid() IN (SELECT user_id FROM profiles WHERE role IN ('chairman', 'head-of-operations')));

-- Create budget management table
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  allocated_amount DECIMAL(12,2) NOT NULL,
  spent_amount DECIMAL(12,2) DEFAULT 0,
  remaining_amount DECIMAL(12,2) GENERATED ALWAYS AS (allocated_amount - spent_amount) STORED,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  department TEXT,
  manager_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view budgets" ON public.budgets FOR SELECT USING (true);
CREATE POLICY "Managers can manage budgets" ON public.budgets FOR ALL USING (auth.uid() IN (SELECT user_id FROM profiles WHERE role IN ('chairman', 'financial-advisor', 'head-of-operations')));

-- Create staff management table
CREATE TABLE public.staff_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE NOT NULL,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  hire_date DATE NOT NULL,
  salary DECIMAL(10,2),
  manager_id UUID REFERENCES auth.users(id),
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  benefits TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated', 'on-leave')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.staff_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view staff records" ON public.staff_records FOR SELECT USING (true);
CREATE POLICY "HR can manage staff records" ON public.staff_records FOR ALL USING (auth.uid() IN (SELECT user_id FROM profiles WHERE role IN ('chairman', 'head-of-operations', 'executive-assistant')));

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  user_id UUID REFERENCES auth.users(id),
  is_read BOOLEAN DEFAULT false,
  is_global BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their alerts" ON public.alerts FOR SELECT USING (auth.uid() = user_id OR is_global = true);
CREATE POLICY "Users can update their alerts" ON public.alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can create alerts" ON public.alerts FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE role IN ('chairman', 'head-of-operations', 'executive-assistant')));

-- Create system settings table
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT false,
  updated_by UUID NOT NULL REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public settings" ON public.system_settings FOR SELECT USING (is_public = true);
CREATE POLICY "Admins can manage settings" ON public.system_settings FOR ALL USING (auth.uid() IN (SELECT user_id FROM profiles WHERE role IN ('chairman', 'head-of-operations')));

-- Create update trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_travel_requests_updated_at BEFORE UPDATE ON public.travel_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_checklists_updated_at BEFORE UPDATE ON public.checklists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_staff_records_updated_at BEFORE UPDATE ON public.staff_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();