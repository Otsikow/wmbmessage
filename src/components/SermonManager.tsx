import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Upload, Loader2, Search, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Sermon {
  id: string;
  title: string;
  date: string;
  location: string;
  created_at: string;
}

interface SermonParagraph {
  id: string;
  sermon_id: string;
  paragraph_number: number;
  content: string;
}

interface BulkImportSermon {
  title: string;
  date: string;
  location: string;
  paragraphs: string[];
}

export default function SermonManager() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [paragraphs, setParagraphs] = useState<SermonParagraph[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);
  const [bulkImportData, setBulkImportData] = useState('');
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const { toast } = useToast();
  const [configError, setConfigError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
  });

  const [paragraphsText, setParagraphsText] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      setConfigError('Supabase is not configured. Sermon management tools are currently disabled.');
      return;
    }

    fetchSermons();
  }, [searchTerm]);

  const fetchSermons = async () => {
    if (!isSupabaseConfigured) return;
    try {
      setLoading(true);
      let query = supabase
        .from('sermons')
        .select('*')
        .order('date', { ascending: false })
        .limit(50);

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSermons(data || []);
      setConfigError(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
      setConfigError('Unable to load sermons. Please check your Supabase configuration.');
    } finally {
      setLoading(false);
    }
  };

  const fetchParagraphs = async (sermonId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('sermon_paragraphs')
        .select('*')
        .eq('sermon_id', sermonId)
        .order('paragraph_number');

      if (error) throw error;
      setParagraphs(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast({
        title: 'Supabase not configured',
        description: 'Connect Supabase to create or update sermons.',
        variant: 'destructive',
      });
      return;
    }
    try {
      if (editingSermon) {
        const { error } = await supabase
          .from('sermons')
          .update(formData)
          .eq('id', editingSermon.id);

        if (error) throw error;

        // Update paragraphs if provided
        if (paragraphsText.trim()) {
          await updateSermonParagraphs(editingSermon.id);
        }

        toast({ title: 'Success', description: 'Sermon updated successfully' });
      } else {
        const { data, error } = await supabase
          .from('sermons')
          .insert([formData])
          .select()
          .single();

        if (error) throw error;

        // Add paragraphs if provided
        if (paragraphsText.trim() && data) {
          await updateSermonParagraphs(data.id);
        }

        toast({ title: 'Success', description: 'Sermon created successfully' });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchSermons();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const updateSermonParagraphs = async (sermonId: string) => {
    if (!isSupabaseConfigured) return;
    // Delete existing paragraphs
    await supabase
      .from('sermon_paragraphs')
      .delete()
      .eq('sermon_id', sermonId);

    // Split by double newlines or numbered paragraphs
    const paragraphsList = paragraphsText
      .split(/\n\n+|\d+\.\s+/)
      .filter((p) => p.trim());

    const paragraphsToInsert = paragraphsList.map((content, index) => ({
      sermon_id: sermonId,
      paragraph_number: index + 1,
      content: content.trim(),
    }));

    const { error } = await supabase
      .from('sermon_paragraphs')
      .insert(paragraphsToInsert);

    if (error) throw error;
  };

  const handleDelete = async (id: string) => {
    if (!isSupabaseConfigured) {
      toast({
        title: 'Supabase not configured',
        description: 'Connect Supabase to delete sermons.',
        variant: 'destructive',
      });
      return;
    }
    if (!confirm('Are you sure you want to delete this sermon and all its paragraphs?')) return;

    try {
      const { error } = await supabase
        .from('sermons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Sermon deleted successfully' });
      fetchSermons();
      if (selectedSermon?.id === id) {
        setSelectedSermon(null);
        setParagraphs([]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleBulkImport = async () => {
    if (!isSupabaseConfigured) {
      toast({
        title: 'Supabase not configured',
        description: 'Connect Supabase to import sermons.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const parsed = JSON.parse(bulkImportData) as BulkImportSermon[];
      
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid format: Expected an array');
      }

      for (const sermon of parsed) {
        const { data: sermonData, error: sermonError } = await supabase
          .from('sermons')
          .insert({
            title: sermon.title,
            date: sermon.date,
            location: sermon.location,
          })
          .select()
          .single();

        if (sermonError) throw sermonError;

        if (sermon.paragraphs && sermon.paragraphs.length > 0) {
          const paragraphsToInsert = sermon.paragraphs.map((content, index) => ({
            sermon_id: sermonData.id,
            paragraph_number: index + 1,
            content: content.trim(),
          }));

          const { error: paragraphError } = await supabase
            .from('sermon_paragraphs')
            .insert(paragraphsToInsert);

          if (paragraphError) throw paragraphError;
        }
      }

      toast({
        title: 'Success',
        description: `Imported ${parsed.length} sermons successfully`,
      });
      setIsBulkDialogOpen(false);
      setBulkImportData('');
      fetchSermons();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      location: '',
    });
    setParagraphsText('');
    setEditingSermon(null);
  };

  const openEditDialog = async (sermon: Sermon) => {
    if (!isSupabaseConfigured) {
      toast({
        title: 'Supabase not configured',
        description: 'Connect Supabase to edit sermons.',
        variant: 'destructive',
      });
      return;
    }

    setEditingSermon(sermon);
    setFormData({
      title: sermon.title,
      date: sermon.date,
      location: sermon.location,
    });

    // Fetch paragraphs
    try {
      const { data, error } = await supabase
        .from('sermon_paragraphs')
        .select('*')
        .eq('sermon_id', sermon.id)
        .order('paragraph_number');

      if (error) throw error;
      
      if (data) {
        setParagraphsText(data.map(p => p.content).join('\n\n'));
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }

    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSermonClick = (sermon: Sermon) => {
    setSelectedSermon(sermon);
    fetchParagraphs(sermon.id);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle>WMB Sermons Management</CardTitle>
          <CardDescription>Manage William Branham sermons and content</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={!isSupabaseConfigured}>
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] w-full max-w-3xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Bulk Import Sermons</DialogTitle>
                <DialogDescription>
                  Paste JSON array of sermons. Format: {`[{"title": "...", "date": "YYYY-MM-DD", "location": "...", "paragraphs": ["...", "..."]}]`}
                </DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="Paste JSON data here..."
                value={bulkImportData}
                onChange={(e) => setBulkImportData(e.target.value)}
                className="min-h-[320px] font-mono text-sm"
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkImport} disabled={!bulkImportData.trim()}>
                  Import Sermons
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog} disabled={!isSupabaseConfigured}>
                <Plus className="h-4 w-4 mr-2" />
                Add Sermon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] w-full max-w-3xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingSermon ? 'Edit Sermon' : 'Add New Sermon'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="The Spoken Word"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Jeffersonville, IN"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Content (Paragraphs)</Label>
                  <Textarea
                    value={paragraphsText}
                    onChange={(e) => setParagraphsText(e.target.value)}
                    placeholder="Enter sermon content. Separate paragraphs with double line breaks..."
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tip: Separate paragraphs with blank lines or number them (1. 2. 3...)
                  </p>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingSermon ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {configError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Supabase connection required</AlertTitle>
            <AlertDescription>{configError}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="list" className="w-full space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="w-full min-w-max gap-2 bg-muted/60 p-1">
              <TabsTrigger value="list" className="w-full whitespace-nowrap">
                Sermons List
              </TabsTrigger>
              {selectedSermon && (
                <TabsTrigger value="content" className="w-full whitespace-nowrap">
                  Sermon Content
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="list">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sermons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {sermons.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No sermons found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        sermons.map((sermon) => (
                          <TableRow
                            key={sermon.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSermonClick(sermon)}
                          >
                            <TableCell className="font-medium min-w-[200px] whitespace-normal break-words">
                              {sermon.title}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {new Date(sermon.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="min-w-[180px] whitespace-normal break-words">
                              {sermon.location}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEditDialog(sermon)}
                                >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(sermon.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {selectedSermon && (
            <TabsContent value="content" className="mt-4">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-xl font-semibold">{selectedSermon.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {new Date(selectedSermon.date).toLocaleDateString()} • {selectedSermon.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {paragraphs.map((para) => (
                      <div key={para.id} className="border-l-2 border-primary pl-4">
                        <p className="text-sm text-muted-foreground mb-1">¶ {para.paragraph_number}</p>
                        <p className="text-sm leading-relaxed">{para.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
