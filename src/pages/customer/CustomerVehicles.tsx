import React, { useState, useEffect } from 'react';
import { Car, Plus, Navigation, Clock, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { toastApiError, toastValidationError } from '../../utils/feedback';

const CustomerVehicles = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: 0
  });

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicle/my-vehicles');
      setVehicles(res.data);
    } catch (err: unknown) {
      console.error('Failed to fetch vehicles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/vehicle', formData);
      toast.success('Vehicle added to your garage!');
      setIsModalOpen(false);
      fetchVehicles();
    } catch (err: any) {
      toastApiError(err, { context: 'save', fallback: 'Could not add vehicle. The plate number may already be registered.' });
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Car className="text-indigo-500" />
            My <span className="text-indigo-500">Garage</span>
          </h1>
          <p className="text-gray-400 mt-1">Manage your registered vehicles and maintenance records.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus size={20} /> Add Vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500/20 border-t-indigo-500"></div>
            <p className="text-gray-500 mt-4 text-sm font-medium">Loading your garage...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-[#0d0d12] border border-white/5 rounded-2xl">
            <Car size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Your garage is empty</h3>
            <p className="text-gray-400">Add your first vehicle to unlock personalized maintenance tracking.</p>
          </div>
        ) : (
          vehicles.map((vehicle) => (
            <motion.div
              whileHover={{ y: -4 }}
              key={vehicle.id}
              className="bg-[#0d0d12] border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all group"
            >
              <div className="h-32 bg-gradient-to-br from-indigo-900/20 to-purple-900/10 flex items-center justify-center border-b border-white/5">
                <Car size={64} className="text-indigo-400/50 group-hover:text-indigo-400 transition-colors" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{vehicle.brand} {vehicle.model}</h3>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-2 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
                      <ShieldCheck size={12} className="text-indigo-400" />
                      {vehicle.vehicleNumber}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] uppercase text-gray-500 font-bold mb-1 flex items-center gap-1"><Navigation size={12} /> Odometer</p>
                    <p className="font-mono text-white text-sm">{vehicle.mileage.toLocaleString()} km</p>
                  </div>
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] uppercase text-gray-500 font-bold mb-1 flex items-center gap-1"><Clock size={12} /> Last Service</p>
                    <p className="text-white text-sm">
                      {vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add to Garage">
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">License Plate</label>
            <input
              value={formData.vehicleNumber}
              onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })}
              className="w-full px-4 py-3 bg-[#0d0d12] border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500"
              placeholder="e.g. ABC-1234"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Brand</label>
              <input
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-3 bg-[#0d0d12] border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500"
                placeholder="Toyota"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Model</label>
              <input
                value={formData.model}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-3 bg-[#0d0d12] border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500"
                placeholder="Camry"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Current Mileage (km)</label>
            <input
              type="number"
              value={formData.mileage}
              onChange={e => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-[#0d0d12] border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500"
              required
            />
          </div>
          <button type="submit" className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20">
            Register Vehicle
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerVehicles;
