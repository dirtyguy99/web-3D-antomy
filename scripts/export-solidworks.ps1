param(
 [Parameter(Mandatory=$true)][string]$SourcePath,
 [Parameter(Mandatory=$true)][string]$StepPath,
 [string]$ComponentInfoPath='.cache/thung-chinh-components.json',
 [switch]$IncludeHiddenComponents,
 [string]$InteropPath='C:/Program Files/SOLIDWORKS Corp/SOLIDWORKS/api/redist/SolidWorks.Interop.sldworks.dll'
)
$ErrorActionPreference='Stop'
$taskSource=(Resolve-Path -LiteralPath $SourcePath).Path
$taskStep=[IO.Path]::GetFullPath($StepPath)
$taskInfo=[IO.Path]::GetFullPath($ComponentInfoPath)
if(Test-Path -LiteralPath $taskStep){throw 'Choose a new STEP output filename; existing files are not overwritten.'}
New-Item -ItemType Directory -Path ([IO.Path]::GetDirectoryName($taskStep)) -Force | Out-Null
New-Item -ItemType Directory -Path ([IO.Path]::GetDirectoryName($taskInfo)) -Force | Out-Null
$taskHash=(Get-FileHash -LiteralPath $taskSource -Algorithm SHA256).Hash
$taskOriginal=$taskSource
# Showing hidden components is confined to a disposable read-only assembly copy.
if($IncludeHiddenComponents){
 $taskCopy=Join-Path ([IO.Path]::GetDirectoryName($taskStep)) ([IO.Path]::GetFileNameWithoutExtension($taskStep)+'-web-export.SLDASM')
 if(Test-Path -LiteralPath $taskCopy){throw 'Choose a new output name; temporary assembly copies are not overwritten.'}
 Copy-Item -LiteralPath $taskSource -Destination $taskCopy
 $taskSource=$taskCopy
}
Add-Type -Path $InteropPath
$taskCode=@'
using System;
using System.IO;
using System.Collections.Generic;
using SolidWorks.Interop.sldworks;
public class WebsiteCADExport {
 public static object[] Run(string source,string destination,bool includeHidden){
  ISldWorks sw=(ISldWorks)Activator.CreateInstance(Type.GetTypeFromProgID("SldWorks.Application"));
  IModelDoc2 previous=sw.ActiveDoc as IModelDoc2;
  string previousTitle=previous==null?null:previous.GetTitle();
  IModelDoc2 model=sw.GetOpenDocumentByName(source) as IModelDoc2;
  bool alreadyOpen=model!=null;int errors=0,warnings=0,activationErrors=0;
  if(model==null)model=sw.OpenDoc6(source,2,3,"",ref errors,ref warnings) as IModelDoc2;
  if(model==null)throw new Exception("Cannot open assembly: "+errors+" / "+warnings);
  try {
   sw.ActivateDoc3(model.GetTitle(),false,2,ref activationErrors);
   IAssemblyDoc assembly=model as IAssemblyDoc;if(assembly==null)throw new Exception("Source is not an assembly.");
   assembly.ResolveAllLightWeightComponents(false);
   var records=new List<Dictionary<string,object>>();int unresolved=0;
   foreach(object item in (object[])assembly.GetComponents(false)){
    IComponent2 c=(IComponent2)item;bool suppressed=c.IsSuppressed();object[] children=c.GetChildren() as object[];IModelDoc2 doc=c.GetModelDoc2() as IModelDoc2;
    if(!suppressed&&doc==null)unresolved++;
    records.Add(new Dictionary<string,object>{{"name",c.Name2},{"path",c.GetPathName()},{"suppressed",suppressed},{"visibility",c.Visible},{"children",children==null?0:children.Length},{"documentType",doc==null?0:doc.GetType()},{"box",suppressed?null:c.GetBox(false,false)}});
   }
   if(unresolved>0)throw new Exception("Unresolved components: "+unresolved);
   if(includeHidden)foreach(object item in (object[])assembly.GetComponents(false)){
    IComponent2 c=(IComponent2)item;if(!c.IsSuppressed())c.Visible=1;
   }
   model.ClearSelection2(true);int saveErrors=0,saveWarnings=0;
   if(!model.Extension.SaveAs(destination,0,1,null,ref saveErrors,ref saveWarnings)||!File.Exists(destination))throw new Exception("STEP export failed: "+saveErrors+" / "+saveWarnings);
   return records.ToArray();
  } finally {
   if(previousTitle!=null&&previousTitle!=model.GetTitle()){int restoreErrors=0;sw.ActivateDoc3(previousTitle,false,2,ref restoreErrors);}
   if(!alreadyOpen)sw.CloseDoc(model.GetTitle());
  }
 }
}
'@
Add-Type -TypeDefinition $taskCode -ReferencedAssemblies $InteropPath
$taskRecords=[WebsiteCADExport]::Run($taskSource,$taskStep,[bool]$IncludeHiddenComponents)
if((Get-FileHash -LiteralPath $taskOriginal -Algorithm SHA256).Hash -ne $taskHash){throw 'Source assembly changed during export.'}
if((Get-FileHash -LiteralPath $taskSource -Algorithm SHA256).Hash -ne $taskHash){throw 'Temporary source assembly changed during export.'}
ConvertTo-Json -InputObject @($taskRecords) -Depth 8 | Set-Content -LiteralPath $taskInfo -Encoding UTF8
[pscustomobject]@{step=$taskStep;components=@($taskRecords).Count;sourceUnchanged=$true}
