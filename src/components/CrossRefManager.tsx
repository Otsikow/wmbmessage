import { useState, useEffect, ChangeEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Upload, Loader2, Search, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BIBLE_BOOKS } from '@/hooks/useBibleData';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getFriendlyErrorMessage } from '@/lib/errorHandling';

interface CrossReference {
  id: string;
  from_book: string;
  from_chapter: number;
  from_verse: number;
  to_book: string;
  to_chapter: number;
  to_verse: number;
  to_verse_end: number | null;
  relationship_type: string | null;
  notes: string | null;
}

interface BulkImportCrossRef {
  from_book: string;
  from_chapter: number;
  from_verse: number;
  to_book: string;
  to_chapter: number;
  to_verse: number;
  to_verse_end?: number | null;
  relationship_type?: string;
  notes?: string;
}

const RELATIONSHIP_TYPES = [
  { value: 'related', label: 'Related' },
  { value: 'parallel', label: 'Parallel' },
  { value: 'quotation', label: 'Quotation' },
  { value: 'fulfillment', label: 'Fulfillment' },
  { value: 'contrast', label: 'Contrast' },
];

export default function CrossRefManager() {
  const [crossRefs, setCrossRefs] = useState<CrossReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCrossRef, setEditingCrossRef] = useState<CrossReference | null>(null);
  const [bulkImportData, setBulkImportData] = useState('');
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkImportFileName, setBulkImportFileName] = useState('');
  const { toast } = useToast();
  const [configError, setConfigError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    from_book: '',
    from_chapter: 1,
    from_verse: 1,
    to_book: '',
    to_chapter: 1,
    to_verse: 1,
    to_verse_end: null as number | null,
    relationship_type: 'related',
    notes: '',
  });

  useEffect(() => {
    fetchCrossRefs();
  }, [searchTerm]);

  const fetchCrossRefs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('cross_references')
        .select('*')
        .order('from_book')
        .order('from_chapter')
        .order('from_verse')
        .limit(100);

      if (searchTerm) {
        query = query.or(`from_book.ilike.%${searchTerm}%,to_book.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCrossRefs(data || []);
      setConfigError(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: getFriendlyErrorMessage(
          error,
          'We could not load cross references. Please try again after checking your connection.',
          'load-cross-references'
        ),
        variant: 'destructive',
      });
      setConfigError('Unable to load cross references. Please verify your Supabase configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCrossRef) {
        const { error } = await supabase
          .from('cross_references')
          .update(formData)
          .eq('id', editingCrossRef.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Cross reference updated successfully' });
      } else {
        const { error } = await supabase
          .from('cross_references')
          .insert([formData]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Cross reference created successfully' });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCrossRefs();
    } catch (error) {
      toast({
        title: 'Error',
        description: getFriendlyErrorMessage(
          error,
          'We could not save this cross reference. Please review the information and try again.',
          editingCrossRef ? 'update-cross-reference' : 'create-cross-reference'
        ),
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cross reference?')) return;

    try {
      const { error } = await supabase
        .from('cross_references')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Cross reference deleted successfully' });
      fetchCrossRefs();
    } catch (error) {
      toast({
        title: 'Error',
        description: getFriendlyErrorMessage(
          error,
          'We could not delete this cross reference. Please try again shortly.',
          'delete-cross-reference'
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
      const parsed = JSON.parse(bulkImportData) as BulkImportCrossRef[];
      
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid format: Expected an array');
      }

      const crossRefsToInsert = parsed.map(item => ({
        from_book: item.from_book,
        from_chapter: item.from_chapter,
        from_verse: item.from_verse,
        to_book: item.to_book,
        to_chapter: item.to_chapter,
        to_verse: item.to_verse,
        to_verse_end: item.to_verse_end || null,
        relationship_type: item.relationship_type || 'related',
        notes: item.notes || null,
      }));

      const { error } = await supabase
        .from('cross_references')
        .insert(crossRefsToInsert);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Imported ${crossRefsToInsert.length} cross references successfully`,
      });
      setIsBulkDialogOpen(false);
      setBulkImportData('');
      setBulkImportFileName('');
      fetchCrossRefs();
    } catch (error) {
      toast({
        title: 'Error',
        description: getFriendlyErrorMessage(
          error,
          'We could not import these cross references. Please check the file contents and try again.',
          'bulk-import-cross-references'
        ),
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      from_book: '',
      from_chapter: 1,
      from_verse: 1,
      to_book: '',
      to_chapter: 1,
      to_verse: 1,
      to_verse_end: null,
      relationship_type: 'related',
      notes: '',
    });
    setEditingCrossRef(null);
  };

  const openEditDialog = (crossRef: CrossReference) => {
    setEditingCrossRef(crossRef);
    setFormData({
      from_book: crossRef.from_book,
      from_chapter: crossRef.from_chapter,
      from_verse: crossRef.from_verse,
      to_book: crossRef.to_book,
      to_chapter: crossRef.to_chapter,
      to_verse: crossRef.to_verse,
      to_verse_end: crossRef.to_verse_end,
      relationship_type: crossRef.relationship_type || 'related',
      notes: crossRef.notes || '',
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const formatVerseRef = (book: string, chapter: number, verse: number, verseEnd?: number | null) => {
    const ref = `${book} ${chapter}:${verse}`;
    return verseEnd ? `${ref}-${verseEnd}` : ref;
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
          <CardTitle>Cross References Management</CardTitle>
          <CardDescription>Manage Bible verse cross-references and relationships</CardDescription>
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
                <DialogTitle>Bulk Import Cross References</DialogTitle>
                <DialogDescription>
                  Paste JSON array of cross references. Format: {`[{"from_book": "John", "from_chapter": 3, "from_verse": 16, "to_book": "Romans", "to_chapter": 5, "to_verse": 8, "relationship_type": "related", "notes": "..."}]`}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="crossref-bulk-upload">Upload JSON file</Label>
                <Input
                  id="crossref-bulk-upload"
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
                className="min-h-[320px] font-mono text-sm"
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkImport} disabled={!bulkImportData.trim()}>
                  Import Cross References
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Cross Reference
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {editingCrossRef ? 'Edit Cross Reference' : 'Add New Cross Reference'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* FROM verse section */}
                  <div className="flex flex-col gap-4 rounded-xl border bg-muted/30 p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                        From Verse
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <Label>Book</Label>
                      <Select
                        value={formData.from_book}
                        onValueChange={(value) => setFormData({ ...formData, from_book: value })}
                      >
                        <SelectTrigger className="h-10">
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

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Chapter</Label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.from_chapter}
                          onChange={(e) =>
                            setFormData({ ...formData, from_chapter: parseInt(e.target.value) })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Verse</Label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.from_verse}
                          onChange={(e) =>
                            setFormData({ ...formData, from_verse: parseInt(e.target.value) })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* TO verse section */}
                  <div className="flex flex-col gap-4 rounded-xl border bg-muted/30 p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                        To Verse
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <Label>Book</Label>
                      <Select
                        value={formData.to_book}
                        onValueChange={(value) => setFormData({ ...formData, to_book: value })}
                      >
                        <SelectTrigger className="h-10">
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

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Chapter</Label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.to_chapter}
                          onChange={(e) =>
                            setFormData({ ...formData, to_chapter: parseInt(e.target.value) })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Verse</Label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.to_verse}
                          onChange={(e) =>
                            setFormData({ ...formData, to_verse: parseInt(e.target.value) })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2 md:col-span-1">
                        <Label>End (opt)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.to_verse_end || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              to_verse_end: e.target.value ? parseInt(e.target.value) : null,
                            })
                          }
                          placeholder="-"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Relationship Type</Label>
                  <Select
                    value={formData.relationship_type}
                    onValueChange={(value) => setFormData({ ...formData, relationship_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIP_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any additional notes about this cross reference..."
                    rows={3}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCrossRef ? 'Update' : 'Create'}
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
              placeholder="Search by book or notes..."
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
                  <TableHead>From Verse</TableHead>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>To Verse</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {crossRefs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No cross references found.
                    </TableCell>
                  </TableRow>
                ) : (
                  crossRefs.map((crossRef) => (
                    <TableRow key={crossRef.id}>
                      <TableCell className="font-medium min-w-[180px] whitespace-normal break-words">
                        {formatVerseRef(
                          crossRef.from_book,
                          crossRef.from_chapter,
                          crossRef.from_verse
                        )}
                      </TableCell>
                      <TableCell>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                      <TableCell className="font-medium min-w-[180px] whitespace-normal break-words">
                        {formatVerseRef(
                          crossRef.to_book,
                          crossRef.to_chapter,
                          crossRef.to_verse,
                          crossRef.to_verse_end
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="whitespace-nowrap">
                          {crossRef.relationship_type || 'related'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs whitespace-normal break-words text-sm text-muted-foreground">
                        {crossRef.notes || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(crossRef)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(crossRef.id)}
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
