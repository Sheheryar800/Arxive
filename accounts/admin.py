from .models import *
from django.contrib import admin


def send_newsletter(modeladmin, request, queryset):
    for newsletter in queryset:
        newsletter.send(request)


send_newsletter.short_description = "Send selected Newsletters to all subscribers"


class NewsletterAdmin(admin.ModelAdmin):
    actions = [send_newsletter]


admin.site.register(Subscriber)
admin.site.register(Newsletter, NewsletterAdmin)
# admin.site.register(Customer)
# admin.site.register(Product)
# admin.site.register(Tag)

admin.site.register(Articles)
admin.site.register(Categories)
