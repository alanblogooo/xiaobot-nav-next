import { useState } from 'react';
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { BookOpen } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import Image from 'next/image';

interface BatchAddColumnsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (urls: string[]) => void;
}

interface PreviewColumn {
  url: string;
  name: string;
  description: string;
  readerCount: number;
  contentCount: number;
  avatar: string;
  author: string;
}

interface SavedColumn {
  id: string;
  url: string;
  name: string;
  author: string;
  description: string;
  avatar: string;
  subscribers: number;
  contentCount: number;
}

interface BatchResponse {
  success: boolean;
  message: string;
  savedData: SavedColumn[];
}

export function BatchAddColumnsDialog({
  open,
  onOpenChange,
  onConfirm,
}: BatchAddColumnsDialogProps) {
  const [urls, setUrls] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewColumn[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handlePreview = async () => {
    const urlList = urls.split('\n').filter(url => url.trim());
    if (!urlList.length) {
      toast.error('请输入专栏链接');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/columns/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: urlList }),
      });
      
      const data = await response.json();
      setPreviewData(data);
      setPageIndex(0); // 重置页码
    } catch (error) {
      console.error('抓取专栏信息失败:', error);
      toast.error('抓取失败');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (previewData.length === 0) {
      toast.error("请先抓取专栏信息");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // 直接使用预览数据
      const response = await fetch('/api/columns/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          columns: previewData.map(item => ({
            url: item.url,
            name: item.name,
            description: item.description,
            author: item.author,
            avatar: item.avatar,
            subscribers: item.readerCount,
            contentCount: item.contentCount
          }))
        })
      });

      const result = await response.json() as BatchResponse;
      
      if (result.success) {
        // 先关闭对话框
        onOpenChange(false);
        // 清空数据
        setPreviewData([]);
        setUrls('');
        // 调用刷新函数
        onConfirm(result.savedData.map((item: SavedColumn) => item.url));
        // 最后显示成功提示
        toast.success(result.message);
      } else {
        toast.error(result.message || '添加失败');
      }
    } catch (error) {
      console.error('添加专栏失败:', error);
      toast.error('添加专栏失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 计算当前页的数据
  const startIndex = pageIndex * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageData = previewData.slice(startIndex, endIndex);
  const total = previewData.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle>批量添加小报童专栏</DialogTitle>
          <DialogDescription>
            请输入专栏地址，每行一个，最多50个，支持自动抓取专栏信息。
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-6 -mr-6">
          <div className="space-y-4 px-3 pt-3">
            <div className="relative">
              <Textarea
                placeholder="请输入专栏地址，每行一个专栏地址"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                rows={5}
                className="min-h-[120px] focus:ring-offset-0"
              />
            </div>
            
            <Button 
              onClick={handlePreview} 
              disabled={loading} 
              className="w-full"
            >
              {loading ? "抓取中..." : "开始抓取"}
            </Button>

            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px] whitespace-nowrap">头像</TableHead>
                      <TableHead className="w-[200px] whitespace-nowrap">专栏名称</TableHead>
                      <TableHead className="w-[100px] whitespace-nowrap">作者</TableHead>
                      <TableHead className="w-[100px] text-right whitespace-nowrap">订阅数</TableHead>
                      <TableHead className="w-[100px] text-right whitespace-nowrap">内容数</TableHead>
                      <TableHead className="w-[300px] whitespace-nowrap">简介</TableHead>
                      <TableHead className="w-[300px] whitespace-nowrap">链接</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPageData.map((column) => (
                      <TableRow key={column.url}>
                        <TableCell className="p-2 align-middle">
                          {column.avatar && column.avatar.startsWith('http') ? (
                            <Image 
                              src={column.avatar} 
                              alt={column.name}
                              width={40}
                              height={40}
                              className="rounded-sm object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = `
                                  <div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                    <svg class="h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                                    </svg>
                                  </div>
                                `;
                              }}
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                              <BookOpen className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="align-middle font-medium whitespace-nowrap">
                          {column.name}
                        </TableCell>
                        <TableCell className="align-middle whitespace-nowrap">
                          {column.author}
                        </TableCell>
                        <TableCell className="text-right align-middle whitespace-nowrap">
                          {column.readerCount}
                        </TableCell>
                        <TableCell className="text-right align-middle whitespace-nowrap">
                          {column.contentCount}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate align-middle" title={column.description}>
                          {column.description || "暂无简介"}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate align-middle" title={column.url}>
                          {column.url}
                        </TableCell>
                      </TableRow>
                    ))}
                    {currentPageData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          {loading ? "正在抓取专栏信息..." : "暂无数据"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {previewData.length > 0 && (
              <div>
                <div className="mt-4 mb-4">
                  <Pagination
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={setPageIndex}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={loading || previewData.length === 0 || isSubmitting}
          >
            {isSubmitting ? "批量保存中..." : "批量保存专栏"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 