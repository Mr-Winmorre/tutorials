from flask_meld import Component

from trial.forms import RegistrationForm


class RegisterComponent(Component):
    form = RegistrationForm()

    def update(self,field):
        self.validate(field)