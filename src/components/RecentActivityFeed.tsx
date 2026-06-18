import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { ShieldCheck, Home, FileText, Bell, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function RecentActivityFeed({ userId, role }: { userId: string, role: string }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // We can query the applications and properties or notifications.
    // The instructions say "such as property inquiries and new KYC submissions"
    // Since we created notifications on KYC submission earlier ("New KYC Submission"), we can use the notifications collection!
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedActivities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivities(fetchedActivities);
      setIsLoading(false);
    }, (error) => {
      console.error(error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-[400px]">
        <h3 className="text-lg font-heading font-bold text-slate-900 mb-4">Recent Activity</h3>
        <div className="flex-1 flex items-center justify-center">
            <span className="text-slate-400 text-sm">Loading activity...</span>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'kyc_submission':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'inquiry':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'property_view':
        return <Home className="w-5 h-5 text-brand-600" />;
      case 'update':
        return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
      case 'system':
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'kyc_submission': return 'bg-emerald-100';
      case 'inquiry': return 'bg-amber-100';
      case 'property_view': return 'bg-brand-100';
      case 'update': return 'bg-blue-100';
      case 'system':
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-0 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-lg font-heading font-bold text-slate-900">Recent Activity</h3>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {activities.length === 0 ? (
          <div className="h-full flex items-center justify-center">
             <p className="text-sm text-slate-500 font-medium pb-10">No recent activity</p>
          </div>
        ) : (
          <div className="relative border-l border-slate-200 ml-6 my-4 space-y-8">
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative pl-6 group">
                <div className={`absolute -left-[18px] top-0.5 w-9 h-9 rounded-full ${getActivityColor(activity.type)} border-4 border-white flex items-center justify-center shadow-sm`}>
                   {getActivityIcon(activity.type)}
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 shadow-sm group-hover:shadow group-hover:border-slate-200 transition-all">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-slate-900">{activity.title}</h4>
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.createdAt ? formatDistanceToNow(activity.createdAt, { addSuffix: true }) : 'Just now'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-snug">{activity.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
