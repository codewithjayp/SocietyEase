/**
 * ARCHITECTURE & FLOW: AdminNotices.tsx
 * 
 * This component allows admins to broadcast announcements to the entire society.
 * It uses the `useAddNotice` mutation to write to Firestore, which then triggers
 * a UI update for all Residents viewing their home screen.
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { useNotices, useAddNotice } from '../../hooks/useFirestore';
import { useAuth } from '../../context/AuthContext';
import { Bell, AlertCircle, FileText, Share2 } from 'lucide-react';
import { shareContent } from '../../utils/share';

export default function AdminNotices() {
  const { userProfile } = useAuth();
  const { data: notices, isLoading } = useNotices();
  const addNoticeMutation = useAddNotice();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.uid) return;

    await addNoticeMutation.mutateAsync({
      title,
      content,
      isImportant,
      postedBy: userProfile.uid
    });

    setTitle('');
    setContent('');
    setIsImportant(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Notice Board</h1>
        <p className="text-gray-400">Manage and broadcast society announcements</p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Create Notice Form */}
        <div className="md:col-span-5 lg:col-span-4 space-y-6">
          <Card className="border-indigo-500/20 shadow-md bg-white/5 backdrop-blur-md">
            <CardHeader className="bg-indigo-500/10 border-b border-indigo-500/20 rounded-t-lg">
              <CardTitle className="text-indigo-300 flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Broadcast Notice
              </CardTitle>
              <CardDescription>Send a new announcement to all residents</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleBroadcast} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Notice Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., Annual General Meeting" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Message Content</Label>
                  <textarea 
                    id="content"
                    className="flex min-h-[120px] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    placeholder="Type your message here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="important"
                    checked={isImportant}
                    onChange={(e) => setIsImportant(e.target.checked)}
                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-indigo-500"
                  />
                  <Label htmlFor="important" className="font-normal text-gray-300 flex items-center cursor-pointer">
                    Mark as Important
                    <AlertCircle className="w-4 h-4 ml-1 text-red-400" />
                  </Label>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={addNoticeMutation.isPending}
                >
                  {addNoticeMutation.isPending ? 'Broadcasting...' : 'Publish Notice'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Notices List */}
        <div className="md:col-span-7 lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-500" />
                Published Notices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <p className="text-center text-gray-400 py-8">Loading notices...</p>
                ) : notices?.length === 0 ? (
                  <div className="text-center py-12 bg-white/5 rounded-lg border border-dashed border-white/10">
                    <Bell className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">No notices have been published yet.</p>
                  </div>
                ) : (
                  notices?.map(notice => (
                    <div 
                      key={notice.id} 
                      className={`p-4 rounded-lg border backdrop-blur-md ${
                        notice.isImportant ? 'border-red-500/30 bg-red-500/10' : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {notice.isImportant && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
                          <h4 className={`text-lg font-semibold ${notice.isImportant ? 'text-red-400' : 'text-white'}`}>
                            {notice.title}
                          </h4>
                        </div>
                        <button
                          onClick={() => shareContent(notice.title, notice.content)}
                          className="p-2 text-gray-400 hover:text-indigo-400 transition-colors rounded-full hover:bg-white/10"
                          title="Share Notice"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="mt-2 text-gray-400 text-sm whitespace-pre-wrap">{notice.content}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
