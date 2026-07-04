from django.http import JsonResponse

def status_view(request):
    return JsonResponse({"service": "python-analytics", "status": "ok", "port": 8001})
