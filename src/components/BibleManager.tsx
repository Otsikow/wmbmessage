import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Upload, Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BIBLE_BOOKS } from '@/hooks/useBibleData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getFriendlyErrorMessage } from '@/lib/errorHandling';

interface BibleVerse {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
  is_jesus_words: boolean;
}

interface BulkImportItem {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation?: string;
  is_jesus_words?: boolean;
}

export default function BibleManager() {
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVerse, setEditingVerse] = useState<BibleVerse | null>(null);
  const [bulkImportData, setBulkImportData] = useState('');
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkImportFileName, setBulkImportFileName] = useState('');
  const { toast } = useToast();
  const [configError, setConfigError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    book: '',
    chapter: 1,
    verse: 1,
    text: '',
    translation: 'KJV',
    is_jesus_words: false,
  });

  useEffect(() => {
    fetchVerses();
  }, [searchTerm]);

  const fetchVerses = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('bible_verses')
        .select('*')
        .order('book')
        .order('chapter')
        .order('verse')
        .limit(100);

      if (searchTerm) {
        query = query.or(`book.ilike.%${searchTerm}%,text.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setVerses(data || []);
      setConfigError(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: getFriendlyErrorMessage(
          error,
          'We could not load Bible verses. Please try again after checking your connection.',
          'load-bible-verses'
        ),
        variant: 'destructive',
      });
      setConfigError('Unable to load Bible verses. Please verify your Supabase setup or try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingVerse) {
        const { error } = await supabase
          .from('bible_verses')
          .update(formData)
          .eq('id', editingVerse.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Verse updated successfully' });
      } else {
        const { error } = await supabase
          .from('bible_verses')
          .insert([formData]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Verse created successfully' });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchVerses();
    } catch (error) {
      toast({
        title: 'Error',
        description: getFriendlyErrorMessage(
          error,
          'We could not save this verse. Please review the details and try again.',
          editingVerse ? 'update-verse' : 'create-verse'
        ),
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this verse?')) return;

    try {
      const { error } = await supabase
        .from('bible_verses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Verse deleted successfully' });
      fetchVerses();
    } catch (error) {
      toast({
        title: 'Error',
        description: getFriendlyErrorMessage(
          error,
          'We could not delete this verse. Please try again shortly.',
          'delete-verse'
        ),
        variant: 'destructive',
      });
    }
  };

  const handleBulkFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const input = event.target;

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';

      if (text) {
        setBulkImportData(text);
        setBulkImportFileName(file.name);
        toast({
          title: 'File loaded',
          description: `${file.name} ready for import`,
        });
      }

      input.value = '';
    };

    reader.onerror = () => {
      toast({
        title: 'Error reading file',
        description: 'Please verify the file format and try again.',
        variant: 'destructive',
      });
      setBulkImportFileName('');
      input.value = '';
    };

    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    try {
      const parsed = JSON.parse(bulkImportData) as BulkImportItem[];
      
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid format: Expected an array');
      }

      const versesToInsert = parsed.map(item => ({
        book: item.book,
        chapter: item.chapter,
        verse: item.verse,
        text: item.text,
        translation: item.translation || 'KJV',
        is_jesus_words: item.is_jesus_words || false,
      }));

      const { error } = await supabase
        .from('bible_verses')
        .insert(versesToInsert);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Imported ${versesToInsert.length} verses successfully`,
      });
      setIsBulkDialogOpen(false);
      setBulkImportData('');
      setBulkImportFileName('');
      fetchVerses();
    } catch (error) {
      toast({
        title: 'Error',
        description: getFriendlyErrorMessage(
          error,
          'We could not import these verses. Please check the file contents and try again.',
          'bulk-import-verses'
        ),
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      book: '',
      chapter: 1,
      verse: 1,
      text: '',
      translation: 'KJV',
      is_jesus_words: false,
    });
    setEditingVerse(null);
  };

  const openEditDialog = (verse: BibleVerse) => {
    setEditingVerse(verse);
    setFormData({
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      text: verse.text,
      translation: verse.translation,
      is_jesus_words: verse.is_jesus_words,
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleBulkDialogChange = (open: boolean) => {
    setIsBulkDialogOpen(open);
    if (!open) {
      setBulkImportData('');
      setBulkImportFileName('');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle>Bible Verses Management</CardTitle>
          <CardDescription>Add, edit, and manage Bible verses</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={isBulkDialogOpen} onOpenChange={handleBulkDialogChange}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] w-full max-w-3xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Bulk Import Bible Verses</DialogTitle>
                <DialogDescription>
                  Paste JSON array of verses to import. Format: {`[{"book": "Genesis", "chapter": 1, "verse": 1, "text": "...", "translation": "KJV", "is_jesus_words": false}]`}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="bulk-upload">Upload JSON file</Label>
                <Input
                  id="bulk-upload"
                  type="file"
                  accept="application/json"
                  onChange={handleBulkFileChange}
                />
                {bulkImportFileName && (
                  <p className="text-xs text-muted-foreground">
                    Loaded file: <span className="font-medium">{bulkImportFileName}</span>
                  </p>
                )}
              </div>
              <Textarea
                placeholder="Paste JSON data here..."
                value={bulkImportData}
                onChange={(e) => setBulkImportData(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkImport} disabled={!bulkImportData.trim()}>
                  Import Verses
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Verse
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-2xl sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>{editingVerse ? 'Edit Verse' : 'Add New Verse'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Book</Label>
                    <Select
                      value={formData.book}
                      onValueChange={(value) => setFormData({ ...formData, book: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select book" />
                      </SelectTrigger>
                      <SelectContent>
                        {BIBLE_BOOKS.map((book) => (
                          <SelectItem key={book.name} value={book.name}>
                            {book.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Translation</Label>
                    <Select
                      value={formData.translation}
                      onValueChange={(value) => setFormData({ ...formData, translation: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KJV">KJV</SelectItem>
                        <SelectItem value="NIV">NIV</SelectItem>
                        <SelectItem value="ESV">ESV</SelectItem>
                        <SelectItem value="NKJV">NKJV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Chapter</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.chapter}
                      onChange={(e) => setFormData({ ...formData, chapter: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Verse</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.verse}
                      onChange={(e) => setFormData({ ...formData, verse: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Text</Label>
                  <Textarea
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    rows={5}
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="jesus-words"
                    checked={formData.is_jesus_words}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_jesus_words: checked as boolean })
                    }
                  />
                  <Label htmlFor="jesus-words">Jesus's words (red letter)</Label>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingVerse ? 'Update' : 'Create'}
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

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by book or text..."
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
                  <TableHead>Reference</TableHead>
                  <TableHead>Text</TableHead>
                  <TableHead>Translation</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No verses found. Add some verses to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  verses.map((verse) => (
                    <TableRow key={verse.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {verse.book} {verse.chapter}:{verse.verse}
                      </TableCell>
                      <TableCell className="min-w-[200px] whitespace-normal break-words text-sm text-muted-foreground">
                        {verse.text}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{verse.translation}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(verse)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(verse.id)}
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
      </CardContent>
    </Card>
  );
}
