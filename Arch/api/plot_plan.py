import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import Arc
import io
import json
import numpy as np
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_error(400, "Missing body")
                return
                
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            image_bytes = self.generate_plot(data)
            
            self.send_response(200)
            self.send_header('Content-type', 'image/png')
            self.send_header('Content-Length', str(len(image_bytes)))
            self.end_headers()
            self.wfile.write(image_bytes)
        except Exception as e:
            self.send_error(500, str(e))

    def do_GET(self):
        # Sample data for quick browser testing
        sample_data = {
            "W": 600,
            "H": 600,
            "rooms": [
                {"name": "Living Room", "x": 50, "y": 50, "w": 250, "h": 300, "color": "#7EC8A0", "ftW": 15, "ftH": 18},
                {"name": "Kitchen", "x": 300, "y": 50, "w": 200, "h": 150, "color": "#E8923C", "ftW": 12, "ftH": 10},
                {"name": "Bedroom", "x": 300, "y": 200, "w": 200, "h": 150, "color": "#5A8FC0", "ftW": 12, "ftH": 10}
            ],
            "entrance": {"x": 50, "y": 200, "wall": "left"}
        }
        
        try:
            image_bytes = self.generate_plot(sample_data)
            self.send_response(200)
            self.send_header('Content-type', 'image/png')
            self.send_header('Content-Length', str(len(image_bytes)))
            self.end_headers()
            self.wfile.write(image_bytes)
        except Exception as e:
            self.send_error(500, str(e))

    def generate_plot(self, data):
        rooms = data.get('rooms', [])
        W = data.get('W', 800)
        H = data.get('H', 800)
        entrance = data.get('entrance', None)
        
        # Create figure
        # Scale figure size based on W/H ratio
        fig_w = 10
        fig_h = (H / W) * fig_w if W > 0 else 10
        fig, ax = plt.subplots(figsize=(fig_w, fig_h))
        
        # Set limits and background
        ax.set_xlim(0, W)
        ax.set_ylim(H, 0) # Invert Y for top-left origin
        ax.set_aspect('equal')
        ax.axis('off')
        
        # Draw Rooms
        for room in rooms:
            rx, ry = room['x'], room['y']
            rw, rh = room['w'], room['h']
            color = room.get('color', '#D0D0C8')
            name = room.get('name', 'Room')
            ftW = room.get('ftW', 0)
            ftH = room.get('ftH', 0)
            
            # Add rectangle
            rect = patches.Rectangle((rx, ry), rw, rh, linewidth=2, edgecolor='#333333', facecolor=color, alpha=0.7)
            ax.add_patch(rect)
            
            # Add label
            label = f"{name}\n{ftW}' x {ftH}'" if ftW > 0 else name
            ax.text(rx + rw/2, ry + rh/2, label, ha='center', va='center', fontsize=9, fontweight='bold', color='#1a1a1a')

        # Draw Entrance Door Swing if provided
        if entrance:
            ex, ey = entrance['x'], entrance['y']
            wall = entrance.get('wall', 'top')
            door_size = 40 # px
            
            # Door arc logic
            if wall == 'left':
                # Door swing from left wall
                ax.plot([ex, ex], [ey, ey + door_size], color='brown', lw=3) # Door itself
                arc = Arc((ex, ey + door_size), door_size*2, door_size*2, theta1=270, theta2=360, color='brown', ls='--')
                ax.add_patch(arc)
            elif wall == 'right':
                ax.plot([ex, ex], [ey, ey + door_size], color='brown', lw=3)
                arc = Arc((ex, ey + door_size), door_size*2, door_size*2, theta1=180, theta2=270, color='brown', ls='--')
                ax.add_patch(arc)
            elif wall == 'top':
                ax.plot([ex, ex + door_size], [ey, ey], color='brown', lw=3)
                arc = Arc((ex + door_size, ey), door_size*2, door_size*2, theta1=90, theta2=180, color='brown', ls='--')
                ax.add_patch(arc)
            elif wall == 'bottom':
                ax.plot([ex, ex + door_size], [ey, ey], color='brown', lw=3)
                arc = Arc((ex + door_size, ey), door_size*2, door_size*2, theta1=180, theta2=270, color='brown', ls='--')
                ax.add_patch(arc)

        # Final styling
        plt.tight_layout()
        
        # Save to buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight', dpi=150, transparent=False, facecolor='white')
        plt.close(fig)
        return buf.getvalue()

if __name__ == "__main__":
    # For local testing
    pass
