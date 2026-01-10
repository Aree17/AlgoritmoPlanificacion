from django import forms
from .models import Proceso

class ProcesoForm(forms.ModelForm):
    class Meta:
        model = Proceso
        fields = "__all__"

    def clean_es(self):
        data = self.cleaned_data.get("es")

        if not data:
            return []

        limpias = []
        for op in data:
            if op and len(op) == 2 and op[0] and op[1]:
                limpias.append([int(op[0]), int(op[1])])

        return limpias