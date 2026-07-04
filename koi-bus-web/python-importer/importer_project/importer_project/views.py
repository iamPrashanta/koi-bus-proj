from django.http import JsonResponse

def status_view(request):
    return JsonResponse({"service": "python-importer", "status": "ok", "port": 8002})
